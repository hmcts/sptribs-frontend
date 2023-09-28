import config from 'config';
import ConnectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import { Application } from 'express';
import session from 'express-session';
import * as redis from 'redis';
import FileStoreFactory from 'session-file-store';

const RedisStore = ConnectRedis(session);
const FileStore = FileStoreFactory(session);
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('index');

export const cookieMaxAge = 21 * (60 * 1000); // 21 minutes
const env = process.env.NODE_ENV || 'development';
const productionMode = env === 'production' || env === 'dev-aat';
logger.info('Environment is ' + env);
logger.info('ProductionMode is ' + productionMode);

export class SessionStorage {
  public enableFor(app: Application): void {
    app.use(cookieParser());

    app.use(
      session({
        name: 'sptribs-frontend-session',
        resave: false,
        saveUninitialized: false,
        secret: config.get('session.secret'),
        cookie: {
          secure: productionMode,
          httpOnly: false,
          maxAge: cookieMaxAge,
          sameSite: 'lax',
        },
        rolling: true, // Renew the cookie for another 20 minutes on each request
        store: this.getStore(app),
      })
    );
  }

  private getStore(app: Application) {
    const redisHost = config.get('session.redis.host');
    if (redisHost) {
      const client = redis.createClient({
        host: redisHost as string,
        password: config.get('session.redis.key') as string,
        port: 6380,
        tls: true,
        connect_timeout: 15000,
      });

      app.locals.redisClient = client;
      return new RedisStore({ client });
    }

    return new FileStore({ path: '/tmp' });
  }
}
