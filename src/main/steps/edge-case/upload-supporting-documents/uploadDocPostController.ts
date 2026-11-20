import autobind from 'autobind-decorator';

import { FileMimeTypeInfo, FileType, UploadController } from '../../../app/controller/UploadController';
import { FormFields, FormFieldsFn } from '../../../app/form/Form';

@autobind
export default class UploadDocumentController extends UploadController {
  constructor(protected fields: FormFields | FormFieldsFn) {
    super(fields);
  }

  protected getPropertyName(): string {
    return 'supportingCaseDocuments';
  }

  protected getValidationTotal(): string {
    return 'documentUpload.validation.totalSupportingDocuments';
  }

  public getAcceptedFileMimeType(): Partial<Record<keyof FileType, keyof FileMimeTypeInfo>> {
    return {
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pdf: 'application/pdf',
      png: 'image/png',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      jpg: 'image/jpeg',
      txt: 'text/plain',
      rtf: 'application/rtf',
      rtf2: 'text/rtf',
    };
  }
}
