# services/vault/policies/backend-policy.hcl

path "secret/data/app/jwt" {
  capabilities = ["read"]
}

path "secret/metadata/app/*" {
  capabilities = ["list"]
}

path "database/creds/app-role" {
  capabilities = ["read"]
}