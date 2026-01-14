import autobind from 'autobind-decorator';
import { Response } from 'express';

import { CaseworkerCICDocument, ListValue, State } from '../../app/case/definition';
import { AppRequest } from '../../app/controller/AppRequest';
import { GetController } from '../../app/controller/GetController';
import { CICA_LOOKUP } from '../urls';

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
      // Use the case from session to get case ID and check submission status
      const sessionCase = req.session.userCase;

      // If no case in session or case is not submitted, redirect to CICA lookup
      if (!sessionCase || !sessionCase.id) {
        return res.redirect(CICA_LOOKUP);
      }

      const isSubmitted = sessionCase.state === State.Submitted || sessionCase.state === State.DSS_Submitted;
      if (!isSubmitted) {
        return res.redirect('/subject-details');
      }

      // Fetch fresh case data from API to get the latest documents
      // cicCaseApplicantDocuments is only populated after a fresh API call
      const freshCase = await req.locals.api.getCaseById(sessionCase.id);

      // Extract and format documents from cicCaseApplicantDocuments
      const allDocuments: DashboardDocument[] = [];
      const applicantDocuments: ListValue<CaseworkerCICDocument>[] = freshCase.applicantDocuments || [];

      applicantDocuments.forEach(doc => {
        if (doc.value?.documentLink) {
          const filename = doc.value.documentLink.document_filename || 'Unknown document';
          const documentUrl = doc.value.documentLink.document_url || '';
          // Extract document ID (UUID) from the document URL
          // URL format: http://dm-store/documents/{uuid} or http://dm-store/documents/{uuid}/binary
          const documentId = extractDocumentId(documentUrl);

          if (documentId) {
            // Create download URL that proxies through sptribs-case-api
            const downloadUrl = `/dashboard/document/download?documentId=${encodeURIComponent(documentId)}&filename=${encodeURIComponent(filename)}`;

            allDocuments.push({
              name: filename,
              downloadUrl,
              isLatest: false,
              date: doc.value.date ? formatDate(doc.value.date) : undefined,
              category: doc.value.documentCategory || undefined,
            });
          }
        }
      });

      // Store documents in res.locals for template access
      res.locals.documents = allDocuments;
      res.locals.hasDocuments = allDocuments.length > 0;
      res.locals.caseNumber = sessionCase.id?.toString().replace(/.{4}/g, '$& - ').substring(0, 25);

      // Call parent get method to render
      return super.get(req, res);
    } catch (error) {
      req.locals.logger.error('Error loading dashboard:', error);
      return res.redirect(CICA_LOOKUP);
    }
  }
}

/**
 * Format a date string from API format (YYYY-MM-DD) to display format (DD/MM/YYYY)
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
 * Extract document ID (UUID) from a document URL
 * URL format: http://dm-store/documents/{uuid} or http://dm-store/documents/{uuid}/binary
 */
function extractDocumentId(documentUrl: string): string | null {
  if (!documentUrl) {
    return null;
  }
  // Match UUID pattern in the URL (after /documents/)
  const uuidPattern = /\/documents\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = documentUrl.match(uuidPattern);
  return match ? match[1] : null;
}
