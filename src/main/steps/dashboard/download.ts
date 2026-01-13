import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';

@autobind
export default class DocumentDownloadController {
  public async get(req: AppRequest, res: Response): Promise<void> {
    try {
      const binaryUrl = req.query.url as string;
      const filename = req.query.filename as string;

      if (!binaryUrl) {
        res.status(400).send('Document URL is required');
        return;
      }

      // Download document from CDAM API
      const documentStream = await req.locals.documentApi.downloadDocument(binaryUrl);

      // Set headers for file download
      res.setHeader('Content-Type', documentStream.headers['content-type'] || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename || 'document'}"`);

      // Pipe the document stream to response
      documentStream.data.pipe(res);
    } catch (error) {
      req.locals.logger.error('Error downloading document:', error);
      res.status(500).send('Error downloading document');
    }
  }
}
