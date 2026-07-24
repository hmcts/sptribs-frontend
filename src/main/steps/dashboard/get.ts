import autobind from 'autobind-decorator';
import { Response } from 'express';

import { CaseworkerCICDocument } from '../../app/case/definition';
import { fromApiFormat } from '../../app/case/from-api-format';
import { AppRequest } from '../../app/controller/AppRequest';
import { GetController } from '../../app/controller/GetController';
import { CICA_LOOKUP, CICA_POSTCODE_VERIFICATION, NOT_AUTHORISED } from '../urls';

import { generateContent } from './content';

interface DashboardDocument {
  name: string;
  downloadUrl: string;
  isLatest: boolean;
  date?: string;
  category?: string;
}

@autobind
export default class DashboardGetController extends GetController {
  constructor() {
    super('dashboard/template', generateContent);
  }

  public async get(req: AppRequest, res: Response): Promise<void> {
    try {
      const sessionCase = req.session.userCase;

      if (!sessionCase?.id) {
        return res.redirect(CICA_LOOKUP);
      }

      const postcode = req.session.validatedPostcode;
      if (!postcode) {
        return res.redirect(CICA_POSTCODE_VERIFICATION);
      }

      const dashboardResponse = await req.locals.api.getDocumentsByCaseId(sessionCase.id, postcode);

      req.locals.logger.info(`Backend dashboard response: ${JSON.stringify(dashboardResponse)}`);

      if (dashboardResponse?.cicaCaseResponse) {
        req.session.userCase = {
          ...req.session.userCase,
          id: dashboardResponse.cicaCaseResponse.id,
          state: dashboardResponse.cicaCaseResponse.state as any,
          ...fromApiFormat(dashboardResponse.cicaCaseResponse.data),
        };
      }

      const documentsResponse = dashboardResponse?.documentResponse || {};

      const latestCaseBundleDocuments = (documentsResponse.latestCaseBundleDocuments || [])
        .map(mapDocument)
        .filter(Boolean);

      const contactPartiesDocuments = (documentsResponse.contactPartiesDocuments || [])
        .map(mapDocument)
        .filter(Boolean);

      const orderAndDecisionDocuments = (documentsResponse.orderAndDecisionDocuments || [])
        .map(mapDocument)
        .filter(Boolean);

      res.locals.latestCaseBundleDocuments = latestCaseBundleDocuments;

      res.locals.contactPartiesDocuments = contactPartiesDocuments;

      res.locals.orderAndDecisionDocuments = orderAndDecisionDocuments;

      res.locals.hasDocuments =
        latestCaseBundleDocuments.length > 0 ||
        contactPartiesDocuments.length > 0 ||
        orderAndDecisionDocuments.length > 0;

      res.locals.caseNumber = req.session.userCase.id?.toString().replace('-', '');

      res.locals.userFullName = req.session.userCase.subjectFullName;

      res.locals.rawDashboardResponse = dashboardResponse ? JSON.stringify(dashboardResponse) : 'null';

      return super.get(req, res);
    } catch (error: any) {
      req.locals.logger.error('Error loading dashboard:', error);

      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        req.session.validatedPostcode = undefined;
        return res.redirect(NOT_AUTHORISED);
      }

      return res.redirect(CICA_LOOKUP);
    }
  }
}

function mapDocument(doc: CaseworkerCICDocument): DashboardDocument | null {
  if (!doc.documentLink?.document_url) {
    return null;
  }

  const filename = doc.documentLink.document_filename || 'Unknown document';

  const documentUrl = doc.documentLink.document_url;

  const documentId = extractDocumentId(documentUrl);

  if (!documentId) {
    return null;
  }

  return {
    name: filename,
    downloadUrl:
      '/dashboard/document/download' +
      `?documentId=${encodeURIComponent(documentId)}` +
      `&filename=${encodeURIComponent(filename)}`,
    isLatest: false,
    //need to update to issued date not the date when the doc was created
    //for bundles its just when bundle created
    //for orders its when order was sent out (draft to not)
    //for rest its when correspondence eas sent out
    date: doc.date ? formatDate(doc.date) : undefined,
    category: doc.documentCategory || undefined,
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
