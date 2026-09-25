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

@autobind
export default class DashboardGetController extends GetController {
  constructor() {
    super('dashboard/template', generateContent);
  }

  public async get(req: AppRequest, res: Response): Promise<void> {
    const startedAt = Date.now();
    const attemptId = createDashboardAttemptId();
    let upstreamStartedAt: number | undefined;
    let upstreamDurationMs: number | undefined;

    try {
      const sessionCase = req.session.userCase;

      if (!sessionCase?.id) {
        trackDashboardEvent(req, {
          event: 'dashboard_load_rejected',
          attempt_id: attemptId,
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
          attempt_id: attemptId,
          step: 'dashboard',
          outcome: 'postcode_missing',
          next_step: 'cica_postcode_verification',
        });
        return res.redirect(CICA_POSTCODE_VERIFICATION);
      }

      upstreamStartedAt = Date.now();
      const dashboardResponse = await req.locals.api.getDocumentsByCaseId(sessionCase.id, postcode);
      upstreamDurationMs = Date.now() - upstreamStartedAt;

      if (dashboardResponse?.cicaCaseResponse) {
        req.session.userCase = {
          ...req.session.userCase,
          id: dashboardResponse.cicaCaseResponse.id,
          state: dashboardResponse.cicaCaseResponse.state as any,
          ...fromApiFormat(dashboardResponse.cicaCaseResponse.data),
        };
      }

      const documentsResponse = dashboardResponse?.documentResponse || {};

      const receivedLatestCaseBundleDocuments = documentsResponse.latestCaseBundleDocuments || [];
      const receivedContactPartiesDocuments = documentsResponse.contactPartiesDocuments || [];
      const receivedOrderAndDecisionDocuments = documentsResponse.orderAndDecisionDocuments || [];

      const latestCaseBundleDocuments = receivedLatestCaseBundleDocuments.map(mapDocument).filter(Boolean);

      const contactPartiesDocuments = receivedContactPartiesDocuments.map(mapDocument).filter(Boolean);

      const orderAndDecisionDocuments = receivedOrderAndDecisionDocuments.map(mapDocument).filter(Boolean);

      const documentsReceivedCount =
        receivedLatestCaseBundleDocuments.length +
        receivedContactPartiesDocuments.length +
        receivedOrderAndDecisionDocuments.length;
      const documentsDisplayedCount =
        latestCaseBundleDocuments.length + contactPartiesDocuments.length + orderAndDecisionDocuments.length;

      res.locals.latestCaseBundleDocuments = latestCaseBundleDocuments;

      res.locals.contactPartiesDocuments = contactPartiesDocuments;

      res.locals.orderAndDecisionDocuments = orderAndDecisionDocuments;

      res.locals.hasDocuments =
        latestCaseBundleDocuments.length > 0 ||
        contactPartiesDocuments.length > 0 ||
        orderAndDecisionDocuments.length > 0;

      res.locals.caseNumber = req.session.userCase.id?.toString().replace('-', '');

      res.locals.userFullName = req.session.userCase.subjectFullName;

      const renderStartedAt = Date.now();
      await super.get(req, res);
      const renderDurationMs = Date.now() - renderStartedAt;

      trackDashboardEvent(req, {
        event: 'dashboard_loaded',
        attempt_id: attemptId,
        step: 'dashboard',
        outcome: 'success',
        duration_ms: Date.now() - startedAt,
        upstream_duration_ms: upstreamDurationMs,
        render_duration_ms: renderDurationMs,
        has_documents: res.locals.hasDocuments,
        documents_received_count: documentsReceivedCount,
        documents_displayed_count: documentsDisplayedCount,
        documents_skipped_count: documentsReceivedCount - documentsDisplayedCount,
        contact_document_count: contactPartiesDocuments.length,
        order_and_decision_document_count: orderAndDecisionDocuments.length,
        case_bundle_document_count: latestCaseBundleDocuments.length,
      });
    } catch (error: any) {
      const status = error?.response?.status;
      const nextStep = status === 401 ? 'postcode_error' : status === 403 ? 'not_authorised' : 'cica_lookup';

      if (upstreamStartedAt !== undefined && upstreamDurationMs === undefined) {
        upstreamDurationMs = Date.now() - upstreamStartedAt;
      }

      trackDashboardEvent(
        req,
        {
          event: 'dashboard_load_failed',
          attempt_id: attemptId,
          step: 'dashboard',
          outcome:
            status === 401 ? 'postcode_mismatch' : status === 403 ? 'not_authorised' : classifyDashboardError(error),
          next_step: nextStep,
          upstream_status: status,
          error_type: error?.name,
          duration_ms: Date.now() - startedAt,
          upstream_duration_ms: upstreamDurationMs,
        },
        'error'
      );

      if (status === 401 || status === 403) {
        req.session.validatedPostcode = undefined;
        if (req.session.userCase) {
          req.session.userCase['postcode'] = undefined;
        }

        if (status === 401) {
          return res.redirect(POSTCODE_ERROR_URL);
        }

        return res.redirect(NOT_AUTHORISED);
      }

      return res.redirect(CICA_LOOKUP);
    }
  }
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
