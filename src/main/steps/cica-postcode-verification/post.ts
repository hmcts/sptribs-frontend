import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../app/controller/PostController';
import { Form, FormFields } from '../../app/form/Form';
import { CICA_LOOKUP, CICA_POSTCODE_VERIFICATION, DASHBOARD_URL, NOT_AUTHORISED } from '../urls';

import { form } from './content';

@autobind
export default class PostcodeVerificationPostController extends PostController<AnyObject> {
  constructor() {
    super(form.fields);
  }

  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const formInstance = new Form(this.fields as FormFields);
    const formErrors = formInstance.getErrors(req.body);

    if (formErrors.length) {
      req.session.errors = formErrors;
      return this.redirect(req, res, CICA_POSTCODE_VERIFICATION);
    }

    const postcode = req.body.postcode as string;
    const ccdReference = req.session.userCase?.id;

    if (!ccdReference) {
      return this.redirect(req, res, CICA_LOOKUP);
    }

    try {
      req.session.userCase = await req.locals.api.validatePostcode(ccdReference, postcode);
      req.session.validatedPostcode = postcode;

      return this.redirect(req, res, DASHBOARD_URL);
    } catch (error: any) {
      const status = error?.response?.status;

      req.locals.logger.error('Error validating postcode for case reference:', {
        ccdReference,
        status,
        message: error?.message,
      });

      return this.redirect(req, res, NOT_AUTHORISED);
    }
  }
}
