import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';

@autobind
export default class DocumentDownloadController {
  public async get(req: AppRequest, res: Response): Promise<void> {
    try {
      req.locals.logger.info('Commencing GET request for document download');
      const documentId = req.query.documentId as string;
      const filename = req.query.filename as string;
      const ccdReference = req.session.userCase?.id;
      const postcode = req.session.validatedPostcode;

      if (!ccdReference) {
        req.locals.logger.error('Error loading dashboard: Case reference is required');
        res.status(400).send('Case reference is required');
        return;
      }

      if (!documentId) {
        req.locals.logger.error('Error loading dashboard: Document ID is required');
        res.status(400).send('Document ID is required');
        return;
      }

      if (!postcode) {
        req.locals.logger.error('Error loading dashboard: Postcode is required');
        res.status(401).send('Unauthorized');
        return;
      }

      req.locals.logger.info('About to call Case API to download document with ID: ' + documentId);
      // Download document via sptribs-case-api
      const documentResponse = await req.locals.api.downloadDocument(ccdReference, documentId, postcode);
      req.locals.logger.info('Case API called to download document with ID: ' + documentId);

      // Set headers for file download
      const contentType = (documentResponse.headers['content-type'] as string) || 'application/octet-stream';
      const originalFilename = documentResponse.headers['original-file-name'] || filename || 'document';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`);

      // Pipe the document stream to response
      req.locals.logger.info('Piping document stream to response');
      documentResponse.data.pipe(res);
    } catch (error) {
      req.locals.logger.error('Error downloading document:', error);
      res.status(500).send('Error downloading document');
    }
  }
}
