#!/bin/sh

# -----------------------------------------------------------------------------
# 0. PRÉREQUIS : Installation des outils manquants
# -----------------------------------------------------------------------------
echo "Installation de OpenSSL et jq..."
apk add --no-cache openssl jq > /dev/null 2>&1

# -----------------------------------------------------------------------------
# 1. DÉMARRAGE DE VAULT
# -----------------------------------------------------------------------------
echo "Démarrage du serveur Vault (Mode Prod/File)..."
vault server -config=/vault/config/local.hcl &
VAULT_PID=$!

export VAULT_ADDR='http://127.0.0.1:8200'

echo "Attente que le processus Vault réponde..."
until vault status > /dev/null 2>&1 || [ $? -ne 127 ]; do
  echo "En attente de Vault..."
  sleep 1
done

# -----------------------------------------------------------------------------
# 2. INITIALISATION (Si nécessaire)
# -----------------------------------------------------------------------------
INIT_STATUS=$(vault status -format=json | jq -r .initialized)

if [ "$INIT_STATUS" = "false" ]; then
    echo "Vault n'est pas initialisé. Initialisation en cours..."
    
    vault operator init -key-shares=1 -key-threshold=1 -format=json > /vault/config/init-keys.json
    
    echo "Clés générées et sauvegardées dans /vault/config/init-keys.json"
fi

# -----------------------------------------------------------------------------
# 3. DÉVERROUILLAGE (UNSEAL) - À faire à chaque démarrage
# -----------------------------------------------------------------------------
SEAL_STATUS=$(vault status -format=json | jq -r .sealed)

if [ "$SEAL_STATUS" = "true" ]; then
    echo "Vault est scellé. Tentative de déverrouillage..."
    
    if [ -f /vault/config/init-keys.json ]; then
        UNSEAL_KEY=$(jq -r ".unseal_keys_b64[0]" /vault/config/init-keys.json)
        
        vault operator unseal "$UNSEAL_KEY" > /dev/null
        
        if [ $? -eq 0 ]; then
            echo "Vault déverrouillé avec succès."
        else
            echo "Échec du déverrouillage. Vérifiez la clé."
            exit 1
        fi
    else
        echo "Impossible de déverrouiller : fichier /vault/config/init-keys.json introuvable."
        exit 1
    fi
else
    echo "Vault est déjà déverrouillé."
fi

# -----------------------------------------------------------------------------
# 4. CONFIGURATION DE BASE (LOGIN & MOTEURS)
# -----------------------------------------------------------------------------
ROOT_TOKEN=$(jq -r ".root_token" /vault/config/init-keys.json)
export VAULT_TOKEN=$ROOT_TOKEN

if ! vault secrets list -format=json | jq -e '."secret/"' > /dev/null; then
    echo "Activation du moteur KV v2..."
    vault secrets enable -version=2 -path=secret kv
else
    echo "ℹ Moteur KV déjà actif."
fi

if ! vault kv get secret/app/jwt > /dev/null 2>&1; then
    echo "Injection du secret JWT..."
    vault kv put secret/app/jwt value=$(openssl rand -base64 32)
else
    echo "Secret JWT existe déjà."
fi

if ! vault secrets list -format=json | jq -e '."database/"' > /dev/null; then
    echo "Activation du moteur Database..."
    vault secrets enable database
else
    echo "ℹ Moteur Database déjà actif."
fi

# -----------------------------------------------------------------------------
# 5. CONFIGURATION DE LA CONNEXION POSTGRESQL
# -----------------------------------------------------------------------------
if ! vault read database/config/postgresql >/dev/null 2>&1; then
    echo "Configuration de la connexion Postgres..."
    vault write database/config/postgresql \
        plugin_name=postgresql-database-plugin \
        allowed_roles="auth-role,users-role,statistics-role,chat-role,gdpr-role,gateway-role" \
        connection_url="postgresql://{{username}}:{{password}}@postgres:5432/transcendance_database?sslmode=disable" \
        username="${POSTGRES_USER}" \
        password="${POSTGRES_PASSWORD}"
else
    echo "Une connexion à postgres existe déjà"
fi

# -----------------------------------------------------------------------------
# 6. CRÉATION DES RÔLES VAULT PAR SERVICE (LEAST PRIVILEGE)
# -----------------------------------------------------------------------------
echo ""
echo "==================================================================="
echo "Création des rôles Vault (safe si tables inexistantes)"
echo "==================================================================="

create_db_role() {
  ROLE_NAME="$1"
  TABLE_PRIVS="$2"

  echo "📝 Création du rôle '${ROLE_NAME}'..."

  vault write database/roles/${ROLE_NAME} \
    db_name=postgresql \
    creation_statements="
      CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';

      GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO \"{{name}}\";
      GRANT USAGE ON SCHEMA public TO \"{{name}}\";
      GRANT CREATE ON SCHEMA public TO \"{{name}}\";

      -- Permissions sur tables existantes
      GRANT ${TABLE_PRIVS} ON ALL TABLES IN SCHEMA public TO \"{{name}}\";
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO \"{{name}}\";

      -- Permissions sur tables futures créées par N'IMPORTE QUEL utilisateur
      ALTER DEFAULT PRIVILEGES FOR ROLE ${POSTGRES_USER} IN SCHEMA public
      GRANT ${TABLE_PRIVS} ON TABLES TO \"{{name}}\";

      ALTER DEFAULT PRIVILEGES FOR ROLE ${POSTGRES_USER} IN SCHEMA public
      GRANT USAGE, SELECT ON SEQUENCES TO \"{{name}}\";

      -- Permissions sur les tables que CE rôle créera lui-même
      ALTER DEFAULT PRIVILEGES FOR ROLE \"{{name}}\" IN SCHEMA public
      GRANT ${TABLE_PRIVS} ON TABLES TO \"{{name}}\";

      ALTER DEFAULT PRIVILEGES FOR ROLE \"{{name}}\" IN SCHEMA public
      GRANT USAGE, SELECT ON SEQUENCES TO \"{{name}}\";
    " \
    revocation_statements="
      REASSIGN OWNED BY \"{{name}}\" TO \"${POSTGRES_USER}\";
      DROP OWNED BY \"{{name}}\";
    " \
    default_ttl="1h" \
    max_ttl="24h"
}

create_db_role "auth-role" "SELECT, INSERT, UPDATE, DELETE"

create_db_role "users-role" "SELECT, INSERT, UPDATE, DELETE"

create_db_role "statistics-role" "SELECT, INSERT, UPDATE, DELETE"

create_db_role "chat-role" "SELECT, INSERT, UPDATE, DELETE"

create_db_role "gdpr-role" "SELECT, INSERT, UPDATE, DELETE"

create_db_role "gateway-role" "SELECT"

echo ""
echo "✅ Tous les rôles Vault ont été créés avec succès"

# Rotation du mot de passe root pour sécurité
vault write -force database/rotate-root/postgresql

# -----------------------------------------------------------------------------
# 7. CONFIGURATION APPROLE PAR SERVICE
# -----------------------------------------------------------------------------
echo ""
echo "==================================================================="
echo "Configuration AppRole pour chaque service backend"
echo "==================================================================="

if ! vault auth list | grep -q approle; then
    vault auth enable approle
fi

create_service_approle() {
    SERVICE_NAME=$1
    DB_ROLE=$2
    
    echo ""
    echo "🔐 Configuration de $SERVICE_NAME..."
    
    cat > /tmp/${SERVICE_NAME}-policy.hcl <<EOF
# Accès au secret JWT
path "secret/data/app/jwt" {
  capabilities = ["read"]
}

# Accès aux credentials dynamiques de la base de données
path "database/creds/${DB_ROLE}" {
  capabilities = ["read"]
}

# Accès aux certificats PKI
path "pki/issue/backend" {
  capabilities = ["create", "update"]
}
EOF

    vault policy write ${SERVICE_NAME}-policy /tmp/${SERVICE_NAME}-policy.hcl
    
    vault write auth/approle/role/${SERVICE_NAME}-role \
        token_policies="${SERVICE_NAME}-policy" \
        token_ttl=1h \
        token_max_ttl=24h
    
    ROLE_ID=$(vault read -field=role_id auth/approle/role/${SERVICE_NAME}-role/role-id)
    SECRET_ID=$(vault write -field=secret_id -f auth/approle/role/${SERVICE_NAME}-role/secret-id)
    
    mkdir -p /vault/secrets
    echo "{\"role_id\":\"${ROLE_ID}\", \"secret_id\":\"${SECRET_ID}\", \"db_role\":\"${DB_ROLE}\"}" > /vault/secrets/${SERVICE_NAME}-approle.json
    chmod 644 /vault/secrets/${SERVICE_NAME}-approle.json
    
    echo "✅ $SERVICE_NAME configuré (fichier: ${SERVICE_NAME}-approle.json)"
}

create_service_approle "auth" "auth-role"
create_service_approle "users" "users-role"
create_service_approle "statistics" "statistics-role"
create_service_approle "chat" "chat-role"
create_service_approle "gdpr" "gdpr-role"
create_service_approle "gateway" "gateway-role"

cp /vault/secrets/gateway-approle.json /vault/secrets/approle.json

# -----------------------------------------------------------------------------
# 8. CONFIGURATION PKI POUR CERTIFICATS TLS
# -----------------------------------------------------------------------------
echo ""
echo "==================================================================="
echo "Configuration PKI pour les certificats TLS"
echo "==================================================================="

vault secrets enable pki 2>/dev/null || echo "ℹ PKI déjà activé"
vault secrets tune -max-lease-ttl=8760h pki

# Générer la CA interne
vault write pki/root/generate/internal \
    common_name="42tracker.local" \
    ttl=8760h > /dev/null 2>&1 || echo "ℹ CA déjà générée"

vault write pki/config/urls \
    issuing_certificates="http://vault:8200/v1/pki/ca" \
    crl_distribution_points="http://vault:8200/v1/pki/crl"

vault write pki/roles/backend \
    allowed_domains="gateway,auth,users,statistics,chat,gdpr,frontend,42tracker.local,localhost,waf" \
    allow_subdomains=true \
    allow_bare_domains=true \
    max_ttl="8760h"

TTL="720h"
OUT="/vault/secrets"
ROLE="backend"

services="
gateway:gateway
users:users
auth:auth
statistics:statistics
chat:chat
gdpr:gdpr
waf:waf
"

for entry in $services; do
  NAME=$(echo "$entry" | cut -d: -f1)
  CN=$(echo "$entry" | cut -d: -f2)

  echo "🔐 Génération du certificat pour $NAME ($CN)"

  vault write -format=json pki/issue/$ROLE \
    common_name="$CN" \
    ttl="$TTL" > "$OUT/${NAME}_raw.json"

  jq -r '.data.certificate' "$OUT/${NAME}_raw.json" > "$OUT/${NAME}.crt"
  jq -r '.data.private_key' "$OUT/${NAME}_raw.json" > "$OUT/${NAME}.key"
  jq -r '.data.issuing_ca'  "$OUT/${NAME}_raw.json" > "$OUT/ca.crt"

  rm "$OUT/${NAME}_raw.json"
done

# -----------------------------------------------------------------------------
# 9. RÉSUMÉ ET VALIDATION
# -----------------------------------------------------------------------------
echo ""
echo "==================================================================="
echo "✅ Vault est prêt !"
echo "==================================================================="
echo ""
echo "🔑 ROOT TOKEN: $ROOT_TOKEN"
echo ""
echo "📋 Rôles de base de données créés:"
echo "   - auth-role      → users, refreshed_tokens"
echo "   - users-role     → users, friendships, user_stats, user_history"
echo "   - statistics-role → user_stats, daily_logtime (+ lecture todo_list)"
echo "   - chat-role      → chat_history (+ lecture users, friendships)"
echo "   - gdpr-role      → toutes tables (lecture + suppression)"
echo "   - gateway-role   → users (lecture seule)"
echo ""
echo "🔐 Fichiers AppRole créés:"
ls -lh /vault/secrets/*-approle.json 2>/dev/null | awk '{print "   - " $9}'
echo ""
echo "📜 Certificats TLS créés:"
ls -lh /vault/secrets/*.crt 2>/dev/null | awk '{print "   - " $9}'
echo ""
echo "==================================================================="

wait $VAULT_PID