import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';

@autobind
export default class DocumentDownloadController {
  public async get(req: AppRequest, res: Response): Promise<void> {
    try {
      const documentId = req.query.documentId as string;
      const filename = req.query.filename as string;

      if (!documentId) {
        res.status(400).send('Document ID is required');
        return;
      }

      // Download document via sptribs-case-api
      const documentResponse = await req.locals.api.downloadDocument(documentId);

      // Set headers for file download
      const contentType = documentResponse.headers['content-type'] || 'application/octet-stream';
      const originalFilename = documentResponse.headers['original-file-name'] || filename || 'document';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`);

      // Pipe the document stream to response
      documentResponse.data.pipe(res);
    } catch (error) {
      req.locals.logger.error('Error downloading document:', error);
      res.status(500).send('Error downloading document');
    }
  }
}
