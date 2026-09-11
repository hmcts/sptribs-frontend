provider "azurerm" {
  features {}
}

locals {
  vaultName                  = "${var.product}-${var.env}"
  managed_redis_environments = toset(["preview", "aat", "demo"])
  use_managed_redis          = contains(local.managed_redis_environments, var.env)
  managed_redis_instances    = local.use_managed_redis ? toset([var.env]) : toset([])
}

data "azurerm_subnet" "core_infra_redis_subnet" {
  for_each = local.managed_redis_instances

  name                 = "core-infra-subnet-2-${var.env}"
  virtual_network_name = "core-infra-vnet-${var.env}"
  resource_group_name  = "core-infra-${var.env}"
}

module "sptribs-frontend-session-storage" {
  count                         = local.use_managed_redis ? 0 : 1
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

moved {
  from = module.sptribs-frontend-session-storage
  to   = module.sptribs-frontend-session-storage[0]
}

module "sptribs_frontend_managed_redis" {
  for_each = local.managed_redis_instances
  source   = "git@github.com:hmcts/terraform-module-azure-managed-redis?ref=main"

  product     = var.product
  component   = var.component
  env         = var.env
  location    = var.location
  common_tags = var.common_tags

  sku_name                  = var.managed_redis_sku
  high_availability_enabled = true

  public_network_access   = "Disabled"
  create_private_endpoint = true
  subnet_id               = data.azurerm_subnet.core_infra_redis_subnet[each.key].id
  private_dns_zone_ids = [
    "/subscriptions/${var.private_dns_subscription_id}/resourceGroups/core-infra-intsvc-rg/providers/Microsoft.Network/privateDnsZones/privatelink.redis.azure.net"
  ]

  access_keys_authentication_enabled = true
  client_protocol                    = "Encrypted"
  clustering_policy                  = "EnterpriseCluster"
  eviction_policy                    = "VolatileLRU"
}

locals {
  active_redis_host = local.use_managed_redis ? (
    module.sptribs_frontend_managed_redis[var.env].hostname
    ) : (
    module.sptribs-frontend-session-storage[0].host_name
  )
  active_redis_port = local.use_managed_redis ? (
    module.sptribs_frontend_managed_redis[var.env].port
    ) : (
    module.sptribs-frontend-session-storage[0].redis_port
  )
  active_redis_access_key = local.use_managed_redis ? (
    module.sptribs_frontend_managed_redis[var.env].primary_access_key
    ) : (
    module.sptribs-frontend-session-storage[0].access_key
  )
  active_redis_source = local.use_managed_redis ? "azure managed redis" : "azure cache for redis"
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
  value        = local.active_redis_access_key
  content_type = "terraform-managed"

  tags = merge(var.common_tags, {
    "source" : "${local.active_redis_source} ${local.active_redis_host}"
  })

  key_vault_id = data.azurerm_key_vault.sptribs_key_vault.id
}

resource "azurerm_key_vault_secret" "redis_hostname" {
  name         = "redis-hostname"
  value        = local.active_redis_host
  content_type = "terraform-managed"

  tags = merge(var.common_tags, {
    "source" : local.active_redis_source
  })

  key_vault_id = data.azurerm_key_vault.sptribs_key_vault.id
}

resource "azurerm_key_vault_secret" "redis_port" {
  name         = "redis-port"
  value        = tostring(local.active_redis_port)
  content_type = "terraform-managed"

  tags = merge(var.common_tags, {
    "source" : local.active_redis_source
  })

  key_vault_id = data.azurerm_key_vault.sptribs_key_vault.id
}
