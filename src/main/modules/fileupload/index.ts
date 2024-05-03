import { Application } from 'express';
import fileUpload from 'express-fileupload';

export class FileUpload {
  public enableFor(app: Application): void {
    const DefaultFileUploadSize: number = 101;
    app.use(
      fileUpload({
        limits: { fileSize: 1024 * 1024 * DefaultFileUploadSize },
      })
    );
  }
}
