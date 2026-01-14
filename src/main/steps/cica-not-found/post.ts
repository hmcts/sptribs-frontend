import autobind from 'autobind-decorator';
import { Response } from 'express';

import { YesOrNo } from '../../app/case/definition';
import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../app/controller/PostController';
import { Form, FormFields } from '../../app/form/Form';
import { CICA_LOOKUP, CICA_NOT_FOUND, SUBJECT_DETAILS } from '../urls';

import { form } from './content';

@autobind
export default class CicaNotFoundPostController extends PostController<AnyObject> {
  constructor() {
    super(form.fields as FormFields);
  }

  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const fields = this.fields as FormFields;
    const formInstance = new Form(fields);
    const formErrors = formInstance.getErrors(req.body);

    if (formErrors.length > 0) {
      req.session.errors = formErrors;
      return this.redirect(req, res, CICA_NOT_FOUND);
    }

    const startNewAppeal = req.body.startNewAppeal as string;

    if (startNewAppeal === YesOrNo.YES) {
      // Start a new application - keep the CICA reference in session
      return this.redirect(req, res, SUBJECT_DETAILS);
    } else {
      // Go back to CICA lookup to re-enter reference
      return this.redirect(req, res, CICA_LOOKUP);
    }
  }
}
