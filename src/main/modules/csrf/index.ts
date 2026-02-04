import { csrfSync } from 'csrf-sync';
import type { Application, NextFunction, Request, Response } from 'express';
import type { LoggerInstance } from 'winston';

import { CSRF_TOKEN_ERROR_URL } from '../../steps/urls';

const { Logger } = require('@hmcts/nodejs-logging');
const logger: LoggerInstance = Logger.getLogger('app');

const { csrfSynchronisedProtection, generateToken } = csrfSync({
  getTokenFromRequest: (req: Request) => req.body?._csrf || (req.query?._csrf as string) || req.headers['csrf-token'],
});

export class CSRFToken {
  public enableFor(app: Application): void {
    app.use(csrfSynchronisedProtection);

    app.use((req: Request, res: Response, next: NextFunction) => {
      res.locals.csrfToken = generateToken(req);
      next();
    });

    app.use((error: Error & { code?: string }, req: Request, res: Response, next: NextFunction) => {
      if (error.code === 'EBADCSRFTOKEN' || error.message === 'invalid csrf token') {
        logger.error(`${error.stack || error}`);
        return res.redirect(CSRF_TOKEN_ERROR_URL);
      }
      next(error);
    });
  }
}
