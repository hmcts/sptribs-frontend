import autobind from 'autobind-decorator';
import { Response } from 'express';

import { BackendDashboardDocument } from '../../app/case/CaseApi';
import { fromApiFormat } from '../../app/case/from-api-format';
import { AppRequest } from '../../app/controller/AppRequest';
import { GetController } from '../../app/controller/GetController';
import { classifyDashboardError, createDashboardAttemptId, trackDashboardEvent } from '../dashboard-telemetry';
import { CICA_LOOKUP, CICA_POSTCODE_VERIFICATION, NOT_AUTHORISED, POSTCODE_ERROR_URL } from '../urls';

import { generateContent } from './content';

interface DashboardDocument {
  name: string;
  downloadUrl: string;
  date?: string;
  category?: string;
  downloaded: boolean;
}

interface DashboardDocuments {
  latestCaseBundleDocuments: DashboardDocument[];
  contactPartiesDocuments: DashboardDocument[];
  orderAndDecisionDocuments: DashboardDocument[];
  receivedCount: number;
  displayedCount: number;
}

interface DashboardRequestError {
  name?: string;
  response?: {
    status?: number;
  };
}

interface DashboardTelemetryContext {
  attemptId: string;
  startedAt: number;
  upstreamStartedAt?: number;
  upstreamDurationMs?: number;
}

@autobind
export default class DashboardGetController extends GetController {
  constructor() {
    super('dashboard/template', generateContent);
  }

  public async get(req: AppRequest, res: Response): Promise<void> {
    const telemetryContext: DashboardTelemetryContext = {
      attemptId: createDashboardAttemptId(),
      startedAt: Date.now(),
    };

    try {
      const sessionCase = req.session.userCase;

      if (!sessionCase?.id) {
        trackDashboardEvent(req, {
          event: 'dashboard_load_rejected',
          attempt_id: telemetryContext.attemptId,
          step: 'dashboard',
          outcome: 'case_missing',
          next_step: 'cica_lookup',
        });
        return res.redirect(CICA_LOOKUP);
      }

      const postcode = req.session.validatedPostcode;
      if (!postcode) {
        trackDashboardEvent(req, {
          event: 'dashboard_load_rejected',
          attempt_id: telemetryContext.attemptId,
          step: 'dashboard',
          outcome: 'postcode_missing',
          next_step: 'cica_postcode_verification',
        });
        return res.redirect(CICA_POSTCODE_VERIFICATION);
      }

      telemetryContext.upstreamStartedAt = Date.now();
      const dashboardResponse = await req.locals.api.getDocumentsByCaseId(sessionCase.id, postcode);
      telemetryContext.upstreamDurationMs = Date.now() - telemetryContext.upstreamStartedAt;

      if (dashboardResponse?.cicaCaseResponse) {
        req.session.userCase = {
          ...req.session.userCase,
          id: dashboardResponse.cicaCaseResponse.id,
          state: dashboardResponse.cicaCaseResponse.state as any,
          ...fromApiFormat(dashboardResponse.cicaCaseResponse.data),
        };
      }

      const documents = buildDashboardDocuments(
        dashboardResponse?.documentResponse?.latestCaseBundleDocuments,
        dashboardResponse?.documentResponse?.contactPartiesDocuments,
        dashboardResponse?.documentResponse?.orderAndDecisionDocuments
      );
      setDashboardResponseLocals(req, res, documents);

      const renderStartedAt = Date.now();
      await super.get(req, res);
      const renderDurationMs = Date.now() - renderStartedAt;

      trackDashboardEvent(req, {
        event: 'dashboard_loaded',
        attempt_id: telemetryContext.attemptId,
        step: 'dashboard',
        outcome: 'success',
        duration_ms: Date.now() - telemetryContext.startedAt,
        upstream_duration_ms: telemetryContext.upstreamDurationMs,
        render_duration_ms: renderDurationMs,
        has_documents: res.locals.hasDocuments,
        documents_received_count: documents.receivedCount,
        documents_displayed_count: documents.displayedCount,
        documents_skipped_count: documents.receivedCount - documents.displayedCount,
        contact_document_count: documents.contactPartiesDocuments.length,
        order_and_decision_document_count: documents.orderAndDecisionDocuments.length,
        case_bundle_document_count: documents.latestCaseBundleDocuments.length,
      });
    } catch (error: unknown) {
      this.handleDashboardError(req, res, error, telemetryContext);
    }
  }

  private handleDashboardError(
    req: AppRequest,
    res: Response,
    error: unknown,
    telemetryContext: DashboardTelemetryContext
  ): void {
    const requestError = error as DashboardRequestError;
    const status = requestError?.response?.status;
    const failure = getDashboardFailure(status, error);
    const upstreamDurationMs = getUpstreamDuration(telemetryContext);

    trackDashboardEvent(
      req,
      {
        event: 'dashboard_load_failed',
        attempt_id: telemetryContext.attemptId,
        step: 'dashboard',
        outcome: failure.outcome,
        next_step: failure.nextStep,
        upstream_status: status,
        error_type: requestError?.name,
        duration_ms: Date.now() - telemetryContext.startedAt,
        upstream_duration_ms: upstreamDurationMs,
      },
      'error'
    );

    if (status !== 401 && status !== 403) {
      res.redirect(CICA_LOOKUP);
      return;
    }

    req.session.validatedPostcode = undefined;
    if (req.session.userCase) {
      req.session.userCase['postcode'] = undefined;
    }

    if (status === 401) {
      res.redirect(POSTCODE_ERROR_URL);
      return;
    }

    res.redirect(NOT_AUTHORISED);
  }
}

function buildDashboardDocuments(
  receivedLatestCaseBundleDocuments: BackendDashboardDocument[] | undefined,
  receivedContactPartiesDocuments: BackendDashboardDocument[] | undefined,
  receivedOrderAndDecisionDocuments: BackendDashboardDocument[] | undefined
): DashboardDocuments {
  const receivedLatestDocuments = receivedLatestCaseBundleDocuments || [];
  const receivedContactDocuments = receivedContactPartiesDocuments || [];
  const receivedOrderDocuments = receivedOrderAndDecisionDocuments || [];

  const latestCaseBundleDocuments = receivedLatestDocuments.map(mapDocument).filter(isDashboardDocument);
  const contactPartiesDocuments = receivedContactDocuments.map(mapDocument).filter(isDashboardDocument);
  const orderAndDecisionDocuments = receivedOrderDocuments.map(mapDocument).filter(isDashboardDocument);

  const receivedCount =
    receivedLatestDocuments.length + receivedContactDocuments.length + receivedOrderDocuments.length;
  const displayedCount =
    latestCaseBundleDocuments.length + contactPartiesDocuments.length + orderAndDecisionDocuments.length;

  return {
    latestCaseBundleDocuments,
    contactPartiesDocuments,
    orderAndDecisionDocuments,
    receivedCount,
    displayedCount,
  };
}

function isDashboardDocument(document: DashboardDocument | null): document is DashboardDocument {
  return document !== null;
}

function setDashboardResponseLocals(req: AppRequest, res: Response, documents: DashboardDocuments): void {
  res.locals.latestCaseBundleDocuments = documents.latestCaseBundleDocuments;
  res.locals.contactPartiesDocuments = documents.contactPartiesDocuments;
  res.locals.orderAndDecisionDocuments = documents.orderAndDecisionDocuments;
  res.locals.hasDocuments = documents.displayedCount > 0;
  res.locals.caseNumber = req.session.userCase.id?.toString().replace('-', '');
  res.locals.userFullName = req.session.userCase.subjectFullName;
}

function getDashboardFailure(status: number | undefined, error: unknown): { nextStep: string; outcome: string } {
  if (status === 401) {
    return { nextStep: 'postcode_error', outcome: 'postcode_mismatch' };
  }

  if (status === 403) {
    return { nextStep: 'not_authorised', outcome: 'not_authorised' };
  }

  return { nextStep: 'cica_lookup', outcome: classifyDashboardError(error) };
}

function getUpstreamDuration(telemetryContext: DashboardTelemetryContext): number | undefined {
  if (telemetryContext.upstreamStartedAt !== undefined && telemetryContext.upstreamDurationMs === undefined) {
    return Date.now() - telemetryContext.upstreamStartedAt;
  }

  return telemetryContext.upstreamDurationMs;
}

function mapDocument(doc: BackendDashboardDocument): DashboardDocument | null {
  const caseworkerDoc = doc.document;
  if (!caseworkerDoc?.documentLink?.document_url) {
    return null;
  }

  const filename = caseworkerDoc.documentLink.document_filename || 'Unknown document';

  const documentUrl = caseworkerDoc.documentLink.document_url;

  const documentId = extractDocumentId(documentUrl);

  if (!documentId) {
    return null;
  }

  return {
    name: filename,
    downloadUrl: `/dashboard/document/download?documentId=${encodeURIComponent(documentId)}`,
    //need to update to issued date not the date when the doc was created
    //for bundles its just when bundle created
    //for orders its when order was sent out (draft to not)
    //for rest its when correspondence eas sent out
    date: caseworkerDoc.date ? formatDate(caseworkerDoc.date) : undefined,
    category: caseworkerDoc.documentCategory || undefined,
    downloaded: doc.downloaded,
  };
}

/**
 * Format a date string from API format
 * YYYY-MM-DD -> DD/MM/YYYY
 */
function formatDate(dateString: string): string {
  if (!dateString) {
    return '';
  }

  const [year, month, day] = dateString.split('-');

  if (!year || !month || !day) {
    return dateString;
  }

  return `${day}/${month}/${year}`;
}

/**
 * Extract document UUID from DM store URL
 */
function extractDocumentId(documentUrl: string): string | null {
  if (!documentUrl) {
    return null;
  }

  const uuidPattern = /\/documents\/([0-9a-f-]{36})/i;

  const match = uuidPattern.exec(documentUrl);

  return match ? match[1] : null;
}
