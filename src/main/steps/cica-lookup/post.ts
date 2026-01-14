import autobind from 'autobind-decorator';
import { Response } from 'express';

import { State } from '../../app/case/definition';
import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../app/controller/PostController';
import { Form, FormFields } from '../../app/form/Form';
import { CICA_CONFIRM_NEW, CICA_LOOKUP, DASHBOARD_URL, SUBJECT_DETAILS } from '../urls';

import { form } from './content';

@autobind
export default class CicaLookupPostController extends PostController<AnyObject> {
  constructor() {
    super(form.fields as FormFields);
  }

  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const fields = this.fields as FormFields;
    const formInstance = new Form(fields);
    const formErrors = formInstance.getErrors(req.body);

    if (formErrors.length > 0) {
      req.session.errors = formErrors;
      return this.redirect(req, res, CICA_LOOKUP);
    }

    const cicaReference = req.body.cicaReference as string;

    try {
      const foundCase = await req.locals.api.getCaseByCicaReference(cicaReference);

      if (!foundCase) {
        // No case found - ask user if they want to start a new application
        req.session.userCase = { id: '', state: '', cicaReferenceNumber: cicaReference } as any;
        return this.redirect(req, res, CICA_CONFIRM_NEW);
      }

      // Check if the case is in a submitted state
      const isSubmitted = foundCase.state === State.Submitted || foundCase.state === State.DSS_Submitted;

      if (!isSubmitted) {
        // Case exists but isn't submitted - store and redirect to continue
        req.session.userCase = foundCase;
        return this.redirect(req, res, SUBJECT_DETAILS);
      }

      // Store the found case in session and redirect to dashboard
      req.session.userCase = foundCase;
      return this.redirect(req, res, DASHBOARD_URL);
    } catch (error) {
      req.locals.logger.error('Error looking up case by CICA reference:', error);
      // On error, ask user if they want to start a new application
      req.session.userCase = { id: '', state: '', cicaReferenceNumber: cicaReference } as any;
      return this.redirect(req, res, CICA_CONFIRM_NEW);
    }
  }
}
