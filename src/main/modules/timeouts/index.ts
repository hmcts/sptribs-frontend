import config from 'config';
import { Application } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppRequest } from '../../app/controller/AppRequest';
import { ErrorController, HTTPError } from '../../steps/error/error.controller';
import { DOCUMENT_UPLOAD_URL, UPLOAD_OTHER_INFORMATION, UPLOAD_SUPPORTING_DOCUMENTS } from '../../steps/urls';

export class LoadTimeouts {
  public enableFor(app: Application): void {
    const timeoutMs = config.get<number>('timeout');

    app.use((req, res, next) => {
      //not allowing regents for documents upload
      const checkForPaths =
        req.path.startsWith(DOCUMENT_UPLOAD_URL) ||
        req.path.startsWith(UPLOAD_SUPPORTING_DOCUMENTS) ||
        req.path.startsWith(UPLOAD_OTHER_INFORMATION);

      if (!checkForPaths) {
        const errorController = new ErrorController();

        req.setTimeout(timeoutMs, () => {
          const err = new HTTPError('Request Timeout', StatusCodes.REQUEST_TIMEOUT);
          errorController.internalServerError(err, req as AppRequest, res);
        });

        // Set the server response timeout for all HTTP requests
        res.setTimeout(timeoutMs, () => {
          const err = new HTTPError('Service Unavailable', StatusCodes.SERVICE_UNAVAILABLE);
          errorController.internalServerError(err, req as AppRequest, res);
        });
      }

      next();
    });
  }
}
