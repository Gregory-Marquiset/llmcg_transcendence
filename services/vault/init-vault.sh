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

echo "En attente du serveur..."
until vault status > /dev/null 2>&1; do
    stat=$?
    if [ $stat -ne 2 ]; then break; fi
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
# 4. CONFIGURATION (LOGIN & MOTEURS)
# -----------------------------------------------------------------------------
ROOT_TOKEN=$(jq -r ".root_token" /vault/config/init-keys.json)
export VAULT_TOKEN=$ROOT_TOKEN

if ! vault secrets list -format=json | jq -e '."secret/"' > /dev/null; then
    echo "Activation du moteur KV v2..."
    vault secrets enable -version=2 -path=secret kv
else
    echo "ℹMoteur KV déjà actif."
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
    echo "ℹMoteur Database déjà actif."
fi

echo "Configuration de la connexion Postgres..."
vault write database/config/postgresql \
    plugin_name=postgresql-database-plugin \
    allowed_roles="app-role" \
    connection_url="postgresql://{{username}}:{{password}}@postgres:5432/transcendance_database?sslmode=disable" \
    username="${POSTGRES_USER}" \
    password="${POSTGRES_PASSWORD}"

echo "Création du rôle 'app-role'..."
vault write database/roles/app-role \
    db_name=postgresql \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
        GRANT CONNECT ON DATABASE transcendance_database TO \"{{name}}\"; \
        GRANT USAGE, CREATE ON SCHEMA public TO \"{{name}}\"; \
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO \"{{name}}\"; \
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

vault write -force database/rotate-root/postgresql


# -----------------------------------------------------------------------------
# 5. CONFIGURATION APPROLE (Pour le Backend Node.js)
# -----------------------------------------------------------------------------
echo "Activation de l'authentification AppRole..."
if ! vault auth list | grep -q approle; then
    vault auth enable approle
fi

echo "Création de la policy 'backend-policy' depuis le fichier..."

vault policy write backend-policy /vault/policies/backend-policy.hcl

echo "Création du rôle 'backend-role'..."
vault write auth/approle/role/backend-role \
    token_policies="backend-policy"

echo "Génération du RoleID et SecretID..."

# -----------------------------------------------------------------------------
# 6. EXPORT DES CREDENTIALS (VOLUME PARTAGÉ)
# -----------------------------------------------------------------------------
echo "Export des credentials vers /vault/secrets/approle.json..."
mkdir -p /vault/secrets

# On écrit un fichier JSON que le backend pourra lire
echo "{\"role_id\":\"$(vault read -field=role_id auth/approle/role/backend-role/role-id)\", \"secret_id\":\"$(vault write -field=secret_id -f auth/approle/role/backend-role/secret-id)\"}" > /vault/secrets/approle.json
chmod 666 /vault/secrets/approle.json

echo "✅ Vault est prêt !"
echo "🔑 ROOT TOKEN: $ROOT_TOKEN"

wait $VAULT_PID