import autobind from 'autobind-decorator';

import { UploadController } from '../../../app/controller/UploadController';
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
}
