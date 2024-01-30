import autobind from 'autobind-decorator';

import { FileMimeTypeInfo, FileType, UploadController } from '../../../app/controller/UploadController';
import { FormFields, FormFieldsFn } from '../../../app/form/Form';
import { EQUALITY, UPLOAD_OTHER_INFORMATION } from '../../urls';

@autobind
export default class UploadDocumentController extends UploadController {
  constructor(protected readonly fields: FormFields | FormFieldsFn) {
    super(fields);
  }

  protected getPropertyName(): string {
    return 'otherCaseInformation';
  }

  protected getNextPageRedirectUrl(): `/${string}` {
    return EQUALITY;
  }

  protected getCurrentPageRedirectUrl(): `/${string}` {
    return UPLOAD_OTHER_INFORMATION;
  }

  protected getValidationTotal(): string {
    return 'documentUpload.validation.totalOtherInformation';
  }

  protected checkIfNoFilesUploaded(): boolean {
    return false;
  }

  protected shouldSetUpFormData(): boolean {
    return true;
  }

  protected getAcceptedFileMimeType(): Partial<Record<keyof FileType, keyof FileMimeTypeInfo>> {
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
      mp4audio: 'audio/mp4',
      mp4video: 'video/mp4',
      mp3: 'audio/mpeg',
    };
  }
}
