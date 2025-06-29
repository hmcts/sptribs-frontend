import os from 'os';

import healthcheck from '@hmcts/nodejs-healthcheck';
import config from 'config';
import { Application } from 'express';

import { SPTRIBS_CASE_API_BASE_URL } from '../../steps/common/constants/apiConstants';

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
        'authProvider-api': healthcheck.web(new URL('/health', config.get('services.authProvider.url'))),
        'idam-api': healthcheck.web(new URL('/health', idamUrl.replace('/o/token', ''))),
        'case-api': healthcheck.web(new URL('/health', config.get(SPTRIBS_CASE_API_BASE_URL))),
      },
      buildInfo: {
        name: 'sptribs-frontend',
        host: os.hostname(),
        uptime: process.uptime(),
      },
    });
  }
}
