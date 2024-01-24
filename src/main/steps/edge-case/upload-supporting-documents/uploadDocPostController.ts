import autobind from 'autobind-decorator';
import { FormFields, FormFieldsFn } from '../../../app/form/Form';
import { UPLOAD_OTHER_INFORMATION, UPLOAD_SUPPORTING_DOCUMENTS } from '../../urls';
import { UploadController } from '../../../app/controller/UploadController';

@autobind
export default class UploadDocumentController extends UploadController {
  constructor(protected fields: FormFields | FormFieldsFn) {
    super(fields);
  }

  protected getPropertyName() {
    return 'supportingCaseDocuments';
  }

  protected getNextPageRedirectUrl() {
    return UPLOAD_OTHER_INFORMATION;
  }

  protected getCurrentPageRedirectUrl() {
    return UPLOAD_SUPPORTING_DOCUMENTS
  }

  protected getValidationTotal() {
    return "documentUpload.validation.totalSupportingDocuments";
  }

  protected checkIfNoFilesUploaded() {
    return true;
  }
}
