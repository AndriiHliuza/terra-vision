#!/bin/sh

# ------------ Exit script if any exception occurs ------------
set -e

# ------------ Logging ------------
echo "Vault is healthy. Loading secrets to Vault..."




# <<<<<<<<<<<< DEFAULT PROFILE >>>>>>>>>>>>

# ------------ (Shared terra-vision secrets) ------------
vault kv put secret/application             @/vault/secrets/application.json

# ------------ (terra-vision microservices secrets) ------------
# vault kv put secret/terra-vision-auth       @/vault/secrets/terra-vision-auth.json
# vault kv put secret/terra-vision-gateway       @/vault/secrets/terra-vision-gateway.json
# vault kv put secret/terra-vision-ai       @/vault/secrets/terra-vision-ai.json




# <<<<<<<<<<<< PROFILES >>>>>>>>>>>>

# ------------ (Shared terra-vision secrets) ------------
# vault kv put secret/application/local             @/vault/secrets/local/application-local.json

# ------------ (terra-vision microservices secrets) ------------
# vault kv put secret/terra-vision-auth/local       @/vault/secrets/local/terra-vision-auth-local.json
# vault kv put secret/terra-vision-gateway/local       @/vault/secrets/local/terra-vision-gateway-local.json
# vault kv put secret/terra-vision-ai/local       @/vault/secrets/local/terra-vision-ai-local.json




# ------------ Logging ------------
echo "All secrets loaded successfully!"
