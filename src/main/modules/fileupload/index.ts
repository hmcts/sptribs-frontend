import config from 'config';
import { Application } from 'express';
import fileUpload from 'express-fileupload';

export class FileUpload {
  public enableFor(app: Application): void {
    app.use(
      fileUpload({
        limits: { fileSize: config.get<number>('documentUpload.validation.sizeInBytes') },
        uploadTimeout: config.get<number>('uploadTimeout'),
      })
    );
  }
}
