import autobind from 'autobind-decorator';
import { Response } from 'express';
import { AppRequest } from '../../../app/controller/AppRequest';
import { AnyObject } from '../../../app/controller/PostController';
import { Form, FormFields, FormFieldsFn } from '../../../app/form/Form';
import { EQUALITY, UPLOAD_OTHER_INFORMATION } from '../../urls';
import { UploadController } from '../../../app/controller/UploadController';

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
    return "documentUpload.validation.totalOtherInformation";
  }

  protected checkIfNoFilesUploaded() {
    return false;
  }

  /**
   *
   * @param req
   * @param res
   */
  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    this.setUpForm(req);
    super.submit(req, res);
  }

  private setUpForm(req: AppRequest<AnyObject>) {
    const fields = typeof this.fields === 'function' ? this.fields(req.session.userCase) : this.fields;
    const form = new Form(fields);
    const { saveAndSignOut, saveBeforeSessionTimeout, _csrf, ...formData } = form.getParsedBody(req.body);
    req.session.errors = form.getErrors(formData);
    Object.assign(req.session.userCase, formData);
  }
}
