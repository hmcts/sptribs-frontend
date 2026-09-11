import { Logger } from '@hmcts/nodejs-logging';
import config from 'config';
import { RedisStore } from 'connect-redis';
import cookieParser from 'cookie-parser';
import { Application } from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import FileStoreFactory from 'session-file-store';

const FileStore = FileStoreFactory(session);

export const cookieMaxAge = 21 * (60 * 1000); // 21 minutes

export class SessionStorage {
  public enableFor(app: Application, logger: Logger): void {
    app.use(cookieParser());
    app.set('trust proxy', 1);

    app.use(
      session({
        name: 'sptribs-frontend-session',
        resave: false,
        saveUninitialized: false,
        secret: config.get('session.secret'),
        cookie: {
          httpOnly: true,
          maxAge: cookieMaxAge,
          secure: !app.locals.developmentMode,
        },
        rolling: true, // Renew the cookie for another 20 minutes on each request
        store: this.getStore(app, logger),
      })
    );
  }

  private getStore(app: Application, logger: Logger) {
    const redisHost = config.get('session.redis.host') as string;
    if (redisHost) {
      const redisPort = Number(config.get('session.redis.port'));
      const redisService = this.getRedisService(redisHost);

      logger.info(`Configuring ${redisService} as the session store`);

      const client = createClient({
        socket: {
          host: redisHost,
          port: redisPort,
          tls: true,
          connectTimeout: 15000,
        },
        password: config.get('session.redis.key') as string,
      });

      client.connect().catch(logger.error);

      client.on('error', err => logger.error('Redis Client Error', err));
      client.on('ready', () => logger.info(`Connected to ${redisService} session store`));

      app.locals.redisClient = client;
      return new RedisStore({ client });
    }

    return new FileStore({ path: '/tmp' });
  }

  private getRedisService(redisHost: string): string {
    if (redisHost.endsWith('.redis.azure.net')) {
      return 'Azure Managed Redis';
    }
    if (redisHost.endsWith('.redis.cache.windows.net')) {
      return 'Azure Cache for Redis';
    }
    return 'Redis';
  }
}
