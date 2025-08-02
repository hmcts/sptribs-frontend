import * as express from 'express';
import { Express, RequestHandler } from 'express';
import helmet = require('helmet');

export interface HelmetConfig {
  referrerPolicy: string;
}

const dynatraceDomain = 'https://*.dynatrace.com';
const googleAnalyticsDomain = 'https://*.google-analytics.com';
const googleTagManagerDomain = 'https://*.googletagmanager.com';
const webchatAssets = 'https://vcc-assets.8x8.com/';
const webchatDomain1 = 'https://cloud8-cc-geo.8x8.com/vcc-chat-channels/public/webchat/';
const webchatDomain2 = 'https://cloud8-uk-cf.8x8.com/';
const webchatScriptsDomain = 'https://vcc-eu4-cf.8x8.com/';
const webchatAPI1 = 'https://api.global.chalet.8x8.com/';
const webchatAPI2 = 'wss://api.uk.chalet.8x8.com/';
const self = "'self'";

/**
 * Module that enables helmet in the application
 */
export class Helmet {
  constructor(public config: HelmetConfig) {}

  public enableFor(app: Express): void {
    // include default helmet functions
    app.use(helmet() as RequestHandler);

    this.setContentSecurityPolicy(app);
    this.setReferrerPolicy(app, this.config.referrerPolicy);
  }

  private setContentSecurityPolicy(app: express.Express): void {
    const scriptSrc = [
      self,
      googleAnalyticsDomain,
      googleTagManagerDomain,
      dynatraceDomain,
      webchatAssets,
      webchatDomain1,
      webchatDomain2,
      webchatScriptsDomain,
      "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='",
      "'sha256-XbrIe2Mu+2yK4boWprqdknTXJvaHzNkq5hBOh5NMUwE='",
      "'sha256-fp5pXYMr04xi3uGQWSSNcP/yvslgQKHo5fak98t2zbs='",
      "'sha256-iIZgFWxwwTfXESfktlUZ3OqwQ8kLwWS1sKcO4fGGKcM='",
    ];

    if (app.locals.developmentMode) {
      scriptSrc.push("'unsafe-eval'");
    }

    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          connectSrc: [
            self,
            dynatraceDomain,
            webchatAssets,
            webchatDomain1,
            webchatDomain2,
            webchatScriptsDomain,
            webchatAPI1,
            webchatAPI2,
          ],
          defaultSrc: ["'none'"],
          fontSrc: [self, 'data:'],
          imgSrc: [self, googleAnalyticsDomain, googleTagManagerDomain, webchatScriptsDomain],
          objectSrc: [self],
          scriptSrc,
          styleSrc: [self, "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='"],
          frameSrc: ['blob:'],
          manifestSrc: [self],
        },
      }) as RequestHandler
    );
  }

  private setReferrerPolicy(app: express.Express, policy: string): void {
    if (!policy) {
      throw new Error('Referrer policy configuration is required');
    }

    app.use(helmet.referrerPolicy({ policy }) as RequestHandler);
  }
}
