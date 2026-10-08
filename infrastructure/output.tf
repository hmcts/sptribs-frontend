output "env" {
  value = var.env
}

output "managed_redis_hostname" {
  description = "Azure Managed Redis hostname for application configuration."
  value       = try(module.sptribs-frontend-managed_redis[var.env].hostname, null)
}

output "managed_redis_port" {
  description = "Azure Managed Redis TLS port for application configuration."
  value       = try(module.sptribs-frontend-managed_redis[var.env].port, null)
}
