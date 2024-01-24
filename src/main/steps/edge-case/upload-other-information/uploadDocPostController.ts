import autobind from 'autobind-decorator';

import { UploadController } from '../../../app/controller/UploadController';
import { FormFields, FormFieldsFn } from '../../../app/form/Form';
import { EQUALITY, UPLOAD_OTHER_INFORMATION } from '../../urls';

@autobind
export default class UploadDocumentController extends UploadController {
  constructor(protected readonly fields: FormFields | FormFieldsFn) {
    super(fields);
  }

  protected getPropertyName() {
    return 'otherCaseInformation';
  }

  protected getNextPageRedirectUrl() {
    return EQUALITY;
  }

  protected getCurrentPageRedirectUrl() {
    return UPLOAD_OTHER_INFORMATION;
  }

  protected getValidationTotal() {
    return 'documentUpload.validation.totalOtherInformation';
  }

  protected checkIfNoFilesUploaded() {
    return false;
  }

  protected shouldSetUpFormData() {
    return true;
  }
}
