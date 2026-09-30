import { randomUUID } from 'node:crypto';

import { AppRequest } from '../app/controller/AppRequest';

type DashboardJourneySession = AppRequest['session'] & {
  cicaDashboardJourneyId?: string;
};

type DashboardEventName =
  | 'cica_lookup_cancelled'
  | 'cica_lookup_failed'
  | 'cica_lookup_succeeded'
  | 'cica_lookup_validation_failed'
  | 'dashboard_load_failed'
  | 'dashboard_load_rejected'
  | 'dashboard_loaded'
  | 'document_download_aborted'
  | 'document_download_completed'
  | 'document_download_failed'
  | 'document_download_rejected'
  | 'document_download_started'
  | 'document_download_upstream_response_received'
  | 'postcode_error_shown'
  | 'postcode_submission_rejected'
  | 'postcode_submitted'
  | 'postcode_validation_failed';

type DashboardStep =
  'cica_lookup' | 'cica_postcode_verification' | 'dashboard' | 'document_download' | 'postcode_error';

export interface DashboardTelemetryEvent {
  event: DashboardEventName;
  step: DashboardStep;
  outcome: string;
  attempt_id?: string;
  next_step?: string;
  duration_ms?: number;
  upstream_duration_ms?: number;
  render_duration_ms?: number;
  http_status?: number;
  upstream_status?: number;
  error_type?: string;
  validation_error_count?: number;
  has_documents?: boolean;
  documents_received_count?: number;
  documents_displayed_count?: number;
  documents_skipped_count?: number;
  contact_document_count?: number;
  order_and_decision_document_count?: number;
  case_bundle_document_count?: number;
}

interface DashboardError {
  code?: string;
  response?: {
    status?: number;
  };
}

export const getDashboardJourneyId = (req: AppRequest): string => {
  const session = req.session as DashboardJourneySession;
  session.cicaDashboardJourneyId ??= randomUUID();
  return session.cicaDashboardJourneyId;
};

export const startDashboardJourney = (req: AppRequest): string => {
  const session = req.session as DashboardJourneySession;
  session.cicaDashboardJourneyId = randomUUID();
  return session.cicaDashboardJourneyId;
};

export const createDashboardAttemptId = (): string => randomUUID();

export const classifyDashboardError = (error: unknown): string => {
  const dashboardError = error as DashboardError;
  const status = dashboardError?.response?.status;

  if (dashboardError?.code === 'ECONNABORTED' || dashboardError?.code === 'ETIMEDOUT') {
    return 'timeout';
  }

  if (['ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND'].includes(dashboardError?.code || '')) {
    return 'connection_error';
  }

  if (status === 401) {
    return 'unauthorised';
  }

  if (status === 403) {
    return 'forbidden';
  }

  if (status === 404) {
    return 'not_found';
  }

  if (status === 429) {
    return 'rate_limited';
  }

  if (status && status >= 500) {
    return 'upstream_5xx';
  }

  if (status && status >= 400) {
    return 'upstream_4xx';
  }

  return 'unknown_error';
};

export const trackDashboardEvent = (
  req: AppRequest,
  event: DashboardTelemetryEvent,
  level: 'info' | 'error' = 'info'
): void => {
  req.locals.logger[level]('CICA dashboard journey event', {
    journey: 'cica_dashboard',
    journey_id: getDashboardJourneyId(req),
    language: req.session.lang || 'en',
    ...event,
  });
};
