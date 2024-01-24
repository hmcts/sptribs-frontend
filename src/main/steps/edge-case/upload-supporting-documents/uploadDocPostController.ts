import autobind from 'autobind-decorator';

import { UploadController } from '../../../app/controller/UploadController';
import { FormFields, FormFieldsFn } from '../../../app/form/Form';
import { UPLOAD_OTHER_INFORMATION, UPLOAD_SUPPORTING_DOCUMENTS } from '../../urls';

@autobind
export default class UploadDocumentController extends UploadController {
  constructor(protected fields: FormFields | FormFieldsFn) {
    super(fields);
  }

  protected getPropertyName(): string {
    return 'supportingCaseDocuments';
  }

  protected getNextPageRedirectUrl(): `/${string}` {
    return UPLOAD_OTHER_INFORMATION;
  }

  protected getCurrentPageRedirectUrl(): `/${string}` {
    return UPLOAD_SUPPORTING_DOCUMENTS;
  }

  protected getValidationTotal(): string {
    return 'documentUpload.validation.totalSupportingDocuments';
  }
}
