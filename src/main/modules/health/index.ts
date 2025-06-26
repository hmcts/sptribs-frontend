import os from 'os';

import healthcheck from '@hmcts/nodejs-healthcheck';
import config from 'config';
import { Application } from 'express';

/**
 * Sets up the HMCTS info and health endpoints
 */
export class HealthCheck {
  public enableFor(app: Application): void {
    const redis = app.locals.redisClient
      ? healthcheck.raw(() => app.locals.redisClient.ping().then(healthcheck.up).catch(healthcheck.down))
      : null;

    const idamUrl = config.get('services.idam.tokenURL') as string;

    healthcheck.addTo(app, {
      checks: {
        ...(redis ? { redis } : {}),
        'rpe-auth-service-api': healthcheck.web(new URL('/health', config.get('services.authProvider.url'))),
        'idam-api': healthcheck.web(new URL('/health', idamUrl.replace('/o/token', ''))),
        'ccd-data-store-api': healthcheck.web(new URL('/health', config.get('services.ccd.url'))),
      },
      buildInfo: {
        name: 'sptribs-frontend',
        host: os.hostname(),
        uptime: process.uptime(),
      },
    });
  }
}
