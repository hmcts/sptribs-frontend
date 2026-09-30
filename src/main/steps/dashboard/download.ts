import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { isFileNameValid } from '../../app/form/validation';
import { classifyDashboardError, createDashboardAttemptId, trackDashboardEvent } from '../dashboard-telemetry';

interface DownloadTelemetryProperties {
  http_status?: number;
  upstream_status?: number;
  upstream_duration_ms?: number;
  error_type?: string;
}

type DownloadTerminalEvent =
  | 'document_download_aborted'
  | 'document_download_completed'
  | 'document_download_failed'
  | 'document_download_rejected';

@autobind
export default class DocumentDownloadController {
  public async get(req: AppRequest, res: Response): Promise<void> {
    const startedAt = Date.now();
    const attemptId = createDashboardAttemptId();
    let upstreamStartedAt: number | undefined;
    let upstreamDurationMs: number | undefined;
    let hasTerminalEvent = false;
    const logTerminalEvent = (
      event: DownloadTerminalEvent,
      outcome: string,
      properties: DownloadTelemetryProperties,
      isError = false
    ): void => {
      if (hasTerminalEvent) {
        return;
      }

      hasTerminalEvent = true;
      trackDashboardEvent(
        req,
        {
          event,
          attempt_id: attemptId,
          step: 'document_download',
          outcome,
          duration_ms: Date.now() - startedAt,
          ...properties,
        },
        isError ? 'error' : 'info'
      );
    };

    trackDashboardEvent(req, {
      event: 'document_download_started',
      attempt_id: attemptId,
      step: 'document_download',
      outcome: 'started',
    });

    try {
      const documentId = req.query.documentId as string;
      const ccdReference = req.session.userCase?.id;
      const postcode = req.session.validatedPostcode;

      if (!ccdReference) {
        logTerminalEvent('document_download_rejected', 'case_missing', { http_status: 400 });
        res.status(400).send('Case reference is required');
        return;
      }

      if (!documentId) {
        logTerminalEvent('document_download_rejected', 'document_id_missing', { http_status: 400 });
        res.status(400).send('Document ID is required');
        return;
      }

      if (!postcode) {
        logTerminalEvent('document_download_rejected', 'postcode_missing', { http_status: 401 });
        res.status(401).send('Unauthorized');
        return;
      }

      // Download document via sptribs-case-api
      upstreamStartedAt = Date.now();
      const documentResponse = await req.locals.api.downloadDocument(ccdReference, documentId, postcode);
      upstreamDurationMs = Date.now() - upstreamStartedAt;

      trackDashboardEvent(req, {
        event: 'document_download_upstream_response_received',
        attempt_id: attemptId,
        step: 'document_download',
        outcome: 'success',
        duration_ms: Date.now() - startedAt,
        upstream_duration_ms: upstreamDurationMs,
      });

      // Set headers for file download
      const contentType = (documentResponse.headers['content-type'] as string) || 'application/octet-stream';
      const responseFilename = documentResponse.headers['original-file-name'] as string | undefined;
      const originalFilename = isFileNameValid(responseFilename) ? responseFilename : 'document';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`);

      documentResponse.data.once('error', (error: Error) => {
        logTerminalEvent(
          'document_download_failed',
          'stream_error',
          { error_type: error?.name, http_status: 500 },
          true
        );

        if (res.headersSent) {
          res.destroy(error);
        } else {
          res.status(500).send('Error downloading document');
        }
      });

      res.once('finish', () => {
        logTerminalEvent('document_download_completed', 'success', { http_status: res.statusCode });
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

      if (upstreamStartedAt !== undefined && upstreamDurationMs === undefined) {
        upstreamDurationMs = Date.now() - upstreamStartedAt;
      }

      logTerminalEvent(
        'document_download_failed',
        classifyDashboardError(error),
        {
          upstream_status: upstreamStatus,
          upstream_duration_ms: upstreamDurationMs,
          http_status: responseStatus,
          error_type: error?.name,
        },
        true
      );
      res.status(responseStatus).send('Error downloading document');
    }
  }
}
