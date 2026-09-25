import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../app/controller/PostController';
import { Form, FormFields } from '../../app/form/Form';
import { getDashboardJourneyId } from '../dashboard-telemetry';
import { CICA_LOOKUP, CICA_POSTCODE_VERIFICATION, DASHBOARD_URL } from '../urls';

import { form } from './content';

@autobind
export default class PostcodeVerificationPostController extends PostController<AnyObject> {
  constructor() {
    super(form.fields);
  }

  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const journeyId = getDashboardJourneyId(req);
    const formInstance = new Form(this.fields as FormFields);
    const formErrors = formInstance.getErrors(req.body);

    if (formErrors.length) {
      req.locals.logger.info('CICA dashboard journey event', {
        event: 'postcode_validation_failed',
        journey: 'cica_dashboard',
        journeyId,
        step: 'cica_postcode_verification',
        outcome: 'validation_failed',
        validationErrorCount: formErrors.length,
        nextStep: 'cica_postcode_verification',
      });
      req.session.errors = formErrors;
      return this.redirect(req, res, CICA_POSTCODE_VERIFICATION);
    }

    const postcode = req.body.postcode as string;
    const ccdReference = req.session.userCase?.id;

    if (!ccdReference) {
      req.locals.logger.info('CICA dashboard journey event', {
        event: 'postcode_submission_rejected',
        journey: 'cica_dashboard',
        journeyId,
        step: 'cica_postcode_verification',
        outcome: 'case_missing',
        nextStep: 'cica_lookup',
      });
      return this.redirect(req, res, CICA_LOOKUP);
    }

    req.session.validatedPostcode = postcode;

    req.locals.logger.info('CICA dashboard journey event', {
      event: 'postcode_submitted',
      journey: 'cica_dashboard',
      journeyId,
      step: 'cica_postcode_verification',
      outcome: 'submitted',
      nextStep: 'dashboard',
    });

    return this.redirect(req, res, DASHBOARD_URL);
  }
}
