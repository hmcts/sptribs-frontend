import autobind from 'autobind-decorator';

import { FormFields, FormFieldsFn } from '../../../app/form/Form';
import { UPLOAD_APPEAL_FORM, UPLOAD_SUPPORTING_DOCUMENTS } from '../../urls';
import { UploadController } from '../../../app/controller/UploadController';

@autobind
export default class UploadDocumentController extends UploadController {
  constructor(protected readonly fields: FormFields | FormFieldsFn) {
    super(fields);
  }

  protected getPropertyName() {
    return 'caseDocuments';
  }

  protected getNextPageRedirectUrl() {
    return UPLOAD_SUPPORTING_DOCUMENTS;
  }

  protected getCurrentPageRedirectUrl() {
    return UPLOAD_APPEAL_FORM;
  }

  protected getValidationTotal() {
    return "documentUpload.validation.totaldocuments";
  }
}
