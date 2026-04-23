import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../app/controller/PostController';
import { Form, FormFields } from '../../app/form/Form';
import { CICA_CONFIRM_NEW, CICA_LOOKUP, DASHBOARD_URL, NOT_AUTHORISED } from '../urls';

import { form } from './content';

@autobind
export default class CCDLookupPostController extends PostController<AnyObject> {
  constructor() {
    super(form.fields as FormFields);
  }

  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const formInstance = new Form(this.fields as FormFields);
    const formErrors = formInstance.getErrors(req.body);

    if (formErrors.length) {
      req.session.errors = formErrors;
      return this.redirect(req, res, CICA_LOOKUP);
    }

    const ccdReference = req.body.ccdReference as string;

    try {
      const foundCase = await req.locals.api.getCaseByCCDReference(ccdReference);

      if (!foundCase) {
        // No case found - ask user if they want to start a new application
        req.session.userCase = { id: '', state: '', ccdReferenceNumber: ccdReference } as any;
        return this.redirect(req, res, CICA_CONFIRM_NEW);
      }

      // case found → always go to dashboard
      req.session.userCase = foundCase;
      return this.redirect(req, res, DASHBOARD_URL);
    } catch (error: any) {
      const status = error?.response?.status;

      req.locals.logger.error('Error looking up case by CCD reference:', {
        status,
        message: error?.message,
      });

      switch (status) {
        case 404:
          // No case exists → offer to start new, need to update the next page too!
          req.session.userCase = this.buildEmptyCase(ccdReference);
          return this.redirect(req, res, CICA_CONFIRM_NEW);

        case 403:
          // Case exists but user not allowed
          // You probably want a dedicated "not authorised" page
          return this.redirect(req, res, NOT_AUTHORISED);

        case 400:
          // Invalid input (should mostly be caught by frontend validation)
          req.session.errors = [{ propertyName: 'ccdReference', errorType: 'invalid' }];
          return this.redirect(req, res, CICA_LOOKUP);

        default:
          // 500 / unexpected → fail safe
          req.session.userCase = this.buildEmptyCase(ccdReference);
          return this.redirect(req, res, CICA_CONFIRM_NEW);
      }
    }
  }

  private buildEmptyCase(ccdReference: string) {
    return {
      id: '',
      state: '',
      ccdReferenceNumber: ccdReference,
    } as any;
  }
}
