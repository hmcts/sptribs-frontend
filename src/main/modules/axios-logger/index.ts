import { Readable } from 'stream';
import { inspect } from 'util';

import { Application } from 'express';

const formatDataForLog = (data: unknown): string => {
  if (data === undefined) {
    return 'undefined';
  }
  if (data === null) {
    return 'null';
  }
  if (Buffer.isBuffer(data)) {
    return `Buffer(${data.length})`;
  }
  if (data instanceof Readable || typeof (data as { pipe?: unknown }).pipe === 'function') {
    return '[Stream]';
  }
  if (typeof data === 'string') {
    return data;
  }
  if (typeof data !== 'object') {
    return JSON.stringify(data);
  }

  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return inspect(data, { depth: 2 });
  }
};

export class AxiosLogger {
  enableFor(app: Application): void {
    if (app.locals.developmentMode) {
      require('axios-debug-log')({
        request: (debug, req) =>
          debug(
            `Sending "${req.method}" request to: "${req.baseURL || ''}${req.url}" data:`,
            formatDataForLog(req.data)
          ),
        response: (debug, res) =>
          debug(
            `Received response "${res.status} ${res.statusText}" from: "${res.config.baseURL || ''}${
              res.config.url
            }" content type: "${res.headers['content-type']}" data:`,
            formatDataForLog(res.data)
          ),
      });
    }
  }
}
