import autobind from 'autobind-decorator';
import { Response } from 'express';

import { YesOrNo } from '../../app/case/definition';
import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../app/controller/PostController';
import { Form, FormFields } from '../../app/form/Form';
import { CICA_CONFIRM_NEW, CICA_LOOKUP, SUBJECT_DETAILS } from '../urls';

import { form } from './content';

@autobind
export default class CicaConfirmNewPostController extends PostController<AnyObject> {
  constructor() {
    super(form.fields as FormFields);
  }

  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const fields = this.fields as FormFields;
    const formInstance = new Form(fields);
    const formErrors = formInstance.getErrors(req.body);

    if (formErrors.length > 0) {
      req.session.errors = formErrors;
      return this.redirect(req, res, CICA_CONFIRM_NEW);
    }

    const startNewAppeal = req.body.startNewAppeal as string;

    if (startNewAppeal === YesOrNo.YES) {
      // Start a new appeal - keep the CICA reference in session and go to start
      return this.redirect(req, res, SUBJECT_DETAILS);
    } else {
      // User wants to re-enter their CICA reference - clear session and go back
      req.session.userCase = { id: '', state: '' } as any;
      return this.redirect(req, res, CICA_LOOKUP);
    }
  }
}
