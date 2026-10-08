provider "azurerm" {
  features {}
}

locals {
  vaultName = "${var.product}-${var.env}"
  managed_redis_environments = toset(["aat", "demo"])
  managed_redis_instances    = contains(local.managed_redis_environments, var.env) ? toset([var.env]) : toset([])
}

data "azurerm_subnet" "core_infra_redis_subnet" {
  name                 = "core-infra-subnet-1-${var.env}"
  virtual_network_name = "core-infra-vnet-${var.env}"
  resource_group_name  = "core-infra-${var.env}"
}

data "azurerm_subnet" "managed_redis_private_endpoint" {
  for_each = local.managed_redis_instances

  name                 = "core-infra-subnet-2-${var.env}"
  virtual_network_name = "core-infra-vnet-${var.env}"
  resource_group_name  = "core-infra-${var.env}"
}

module "sptribs-frontend-session-storage" {
  source                        = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product                       = var.product
  location                      = var.location
  env                           = var.env
  common_tags                   = var.common_tags
  redis_version                 = "6"
  business_area                 = "cft"
  private_endpoint_enabled      = true
  public_network_access_enabled = false
  sku_name                      = var.sku_name
  family                        = var.family
  capacity                      = var.capacity

}

module "sptribs-frontend-managed_redis" {
  for_each = toset(contains(["sandbox", "aat"], var.env) ? [var.env] : [])

  source = "git@github.com:hmcts/terraform-module-azure-managed-redis?ref=main"

  product     = var.product
  component   = var.component
  env         = var.env
  location    = var.location
  common_tags = var.common_tags

  sku_name = var.managed_redis_sku

  public_network_access   = "Disabled"
  create_private_endpoint = true
  subnet_id = data.azurerm_subnet.managed_redis_private_endpoint[each.key].id
  private_dns_zone_ids    = [
    "/subscriptions/${var.private_dns_subscription_id}/resourceGroups/core-infra-intsvc-rg/providers/Microsoft.Network/privateDnsZones/privatelink.redis.azure.net"
  ]

  access_keys_authentication_enabled = true
  persistence_rdb_backup_frequency   = "6h"
}

data "azurerm_key_vault" "sptribs_key_vault" {
  name                = local.vaultName
  resource_group_name = "sptribs-${var.env}"
}

data "azurerm_key_vault" "s2s_vault" {
  name                = "s2s-${var.env}"
  resource_group_name = "rpe-service-auth-provider-${var.env}"
}

data "azurerm_key_vault_secret" "microservicekey_sptribs_frontend" {
  name         = "microservicekey-sptribs-frontend"
  key_vault_id = data.azurerm_key_vault.s2s_vault.id
}

resource "azurerm_key_vault_secret" "s2s-secret" {
  name         = "s2s-secret-sptribs-frontend"
  value        = data.azurerm_key_vault_secret.microservicekey_sptribs_frontend.value
  content_type = "terraform-managed"

  tags = merge(var.common_tags, {
    "source" : "vault ${data.azurerm_key_vault.s2s_vault.name}"
  })

  key_vault_id = data.azurerm_key_vault.sptribs_key_vault.id
}

data "azurerm_key_vault_secret" "idam-ui-secret" {
  name         = "idam-ui-secret"
  key_vault_id = data.azurerm_key_vault.sptribs_key_vault.id
}

data "azurerm_key_vault_secret" "idam-systemupdate-username" {
  name         = "idam-systemupdate-username"
  key_vault_id = data.azurerm_key_vault.sptribs_key_vault.id
}

data "azurerm_key_vault_secret" "idam-systemupdate-password" {
  name         = "idam-systemupdate-password"
  key_vault_id = data.azurerm_key_vault.sptribs_key_vault.id
}

resource "azurerm_key_vault_secret" "redis_access_key" {
  name         = "redis-access-key"
  value        = module.sptribs-frontend-session-storage.access_key
  content_type = "terraform-managed"

  tags = merge(var.common_tags, {
    "source" : "redis ${module.sptribs-frontend-session-storage.host_name}"
  })

  key_vault_id = data.azurerm_key_vault.sptribs_key_vault.id
}
