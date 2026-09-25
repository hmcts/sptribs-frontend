import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { isFileNameValid } from '../../app/form/validation';
import { getDashboardJourneyId } from '../dashboard-telemetry';

@autobind
export default class DocumentDownloadController {
  public async get(req: AppRequest, res: Response): Promise<void> {
    const startedAt = Date.now();
    const journeyId = getDashboardJourneyId(req);
    let hasTerminalEvent = false;
    const logTerminalEvent = (
      event: string,
      outcome: string,
      properties: Record<string, unknown> = {},
      isError = false
    ): void => {
      if (hasTerminalEvent) {
        return;
      }

      hasTerminalEvent = true;
      const metadata = {
        event,
        journey: 'cica_dashboard',
        journeyId,
        step: 'document_download',
        outcome,
        durationMs: Date.now() - startedAt,
        ...properties,
      };

      if (isError) {
        req.locals.logger.error('CICA dashboard journey event', metadata);
      } else {
        req.locals.logger.info('CICA dashboard journey event', metadata);
      }
    };

    req.locals.logger.info('CICA dashboard journey event', {
      event: 'document_download_started',
      journey: 'cica_dashboard',
      journeyId,
      step: 'document_download',
      outcome: 'started',
    });

    try {
      const documentId = req.query.documentId as string;
      const ccdReference = req.session.userCase?.id;
      const postcode = req.session.validatedPostcode;

      if (!ccdReference) {
        logTerminalEvent('document_download_rejected', 'case_missing', { httpStatus: 400 });
        res.status(400).send('Case reference is required');
        return;
      }

      if (!documentId) {
        logTerminalEvent('document_download_rejected', 'document_id_missing', { httpStatus: 400 });
        res.status(400).send('Document ID is required');
        return;
      }

      if (!postcode) {
        logTerminalEvent('document_download_rejected', 'postcode_missing', { httpStatus: 401 });
        res.status(401).send('Unauthorized');
        return;
      }

      // Download document via sptribs-case-api
      const documentResponse = await req.locals.api.downloadDocument(ccdReference, documentId, postcode);

      req.locals.logger.info('CICA dashboard journey event', {
        event: 'document_download_upstream_response_received',
        journey: 'cica_dashboard',
        journeyId,
        step: 'document_download',
        outcome: 'success',
        durationMs: Date.now() - startedAt,
      });

      // Set headers for file download
      const contentType = (documentResponse.headers['content-type'] as string) || 'application/octet-stream';
      const responseFilename = documentResponse.headers['original-file-name'] as string | undefined;
      const originalFilename = isFileNameValid(responseFilename) ? responseFilename : 'document';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`);

      documentResponse.data.once('error', (error: Error) => {
        logTerminalEvent('document_download_failed', 'stream_error', { errorType: error?.name, httpStatus: 500 }, true);

        if (res.headersSent) {
          res.destroy(error);
        } else {
          res.status(500).send('Error downloading document');
        }
      });

      res.once('finish', () => {
        logTerminalEvent('document_download_completed', 'success', { httpStatus: res.statusCode });
      });

      res.once('close', () => {
        if (!res.writableFinished) {
          logTerminalEvent('document_download_aborted', 'client_disconnected', {}, true);
        }
      });

      documentResponse.data.pipe(res);
    } catch (error: any) {
      const upstreamStatus = error?.response?.status;
      const responseStatus = upstreamStatus >= 400 && upstreamStatus < 500 ? upstreamStatus : 500;

      logTerminalEvent(
        'document_download_failed',
        'upstream_error',
        {
          upstreamStatus,
          httpStatus: responseStatus,
          errorType: error?.name,
        },
        true
      );
      res.status(responseStatus).send('Error downloading document');
    }
  }
}
