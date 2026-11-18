locals {
  # Preview uses the AAT cache. Keep production and unlisted environments intact.
  retire_classic_redis = contains(["aat"], var.env)
}

# Preserve existing resource identities when adding count, especially in production.
moved {
  from = module.sptribs-frontend-session-storage
  to   = module.sptribs-frontend-session-storage[0]
}

moved {
  from = azurerm_key_vault_secret.redis_access_key
  to   = azurerm_key_vault_secret.redis_access_key[0]
}
