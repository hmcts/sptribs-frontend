import autobind from 'autobind-decorator';
import { Response } from 'express';

import { CaseDocument } from '../../app/case/case';
import { State } from '../../app/case/definition';
import { AppRequest } from '../../app/controller/AppRequest';
import { GetController } from '../../app/controller/GetController';

import { generateContent } from './content';

interface DashboardDocument {
  name: string;
  downloadUrl: string;
  isLatest: boolean;
  comment?: string;
}

@autobind
export default class DashboardGetController extends GetController {
  constructor() {
    super('dashboard/template', generateContent);
  }

  public async get(req: AppRequest, res: Response): Promise<void> {
    try {
      // Get user's cases
      const userCases = await req.locals.api.getCasesByUserId(req.session.user.id);

      // Find the latest submitted case
      const latestCase = userCases.find(
        userCase => userCase.state === State.Submitted || userCase.state === State.DSS_Submitted
      );

      if (!latestCase) {
        // If no submitted case, redirect to subject details
        return res.redirect('/subject-details');
      }

      // Set the case in session for content generation
      req.session.userCase = latestCase;

      // Extract and format documents
      const allDocuments: DashboardDocument[] = [];

      // Combine all document types
      const documentArrays: { documents: CaseDocument[]; type: string }[] = [
        { documents: latestCase.tribunalFormDocuments || [], type: 'Tribunal Form' },
        { documents: latestCase.supportingDocuments || [], type: 'Supporting' },
        { documents: latestCase.otherInfoDocuments || [], type: 'Other Information' },
      ];

      documentArrays.forEach(({ documents }) => {
        documents.forEach(doc => {
          if (doc.value?.documentLink) {
            const filename = doc.value.documentLink.document_filename || 'Unknown document';
            const binaryUrl = doc.value.documentLink.document_binary_url || doc.value.documentLink.document_url;
            // Create download URL that proxies through our server
            const downloadUrl = `/dashboard/document/download?url=${encodeURIComponent(binaryUrl)}&filename=${encodeURIComponent(filename)}`;

            allDocuments.push({
              name: filename,
              downloadUrl,
              isLatest: false, // Will be set after sorting
              comment: doc.value.comment || undefined,
            });
          }
        });
      });

      // // Sort documents by date (most recent first) and mark the latest
      // allDocuments.sort((a, b) => {
      //   const dateA = new Date(a.date).getTime();
      //   const dateB = new Date(b.date).getTime();
      //   return dateB - dateA;
      // });

      // Mark the most recent document(s) as latest
      // if (allDocuments.length > 0) {
      //   const latestDate = allDocuments[0].date;
      //   allDocuments.forEach(doc => {
      //     doc.isLatest = doc.date === latestDate;
      //   });
      // }

      // Store documents in session temporarily for template access
      // The parent get method will call generateContent which we can extend
      // For now, store in res.locals which should be accessible in template
      res.locals.documents = allDocuments;
      res.locals.hasDocuments = allDocuments.length > 0;
      res.locals.caseNumber = latestCase.id?.toString().replace(/.{4}/g, '$& - ').substring(0, 25);

      // Call parent get method to render
      return super.get(req, res);
    } catch (error) {
      req.locals.logger.error('Error loading dashboard:', error);
      // On error, redirect to subject details
      return res.redirect('/subject-details');
    }
  }

  // private extractDateFromDocument(doc: CaseDocument): string {
  //   // Try to extract date from document metadata or use current date as fallback
  //   // Documents may have createdOn or modifiedOn in metadata
  //   // For now, use a fallback - this can be enhanced if document metadata is available
  //   return new Date().toISOString().split('T')[0];
  // }

  // private extractDocumentIdFromUrl(url: string): string | null {
  //   // Document URLs are typically in the format:
  //   // http://dm-store/documents/{documentId}/binary
  //   // http://ccd-case-document-am-api/cases/documents/{documentId}/binary
  //   // http://ccd-case-document-am-api/cases/documents/{documentId}
  //   if (!url) {
  //     return null;
  //   }
  //
  //   // UUID regex pattern
  //   const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  //   const match = url.match(uuidPattern);
  //   return match ? match[0] : null;
  // }
}
