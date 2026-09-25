import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../app/controller/PostController';
import { Form, FormFields } from '../../app/form/Form';
import { createDashboardAttemptId, trackDashboardEvent } from '../dashboard-telemetry';
import { CICA_LOOKUP, CICA_POSTCODE_VERIFICATION, DASHBOARD_URL } from '../urls';

import { form } from './content';

@autobind
export default class PostcodeVerificationPostController extends PostController<AnyObject> {
  constructor() {
    super(form.fields);
  }

  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const attemptId = createDashboardAttemptId();
    const formInstance = new Form(this.fields as FormFields);
    const formErrors = formInstance.getErrors(req.body);

    if (formErrors.length) {
      trackDashboardEvent(req, {
        event: 'postcode_validation_failed',
        attempt_id: attemptId,
        step: 'cica_postcode_verification',
        outcome: 'validation_failed',
        validation_error_count: formErrors.length,
        next_step: 'cica_postcode_verification',
      });
      req.session.errors = formErrors;
      return this.redirect(req, res, CICA_POSTCODE_VERIFICATION);
    }

    const postcode = req.body.postcode as string;
    const ccdReference = req.session.userCase?.id;

    if (!ccdReference) {
      trackDashboardEvent(req, {
        event: 'postcode_submission_rejected',
        attempt_id: attemptId,
        step: 'cica_postcode_verification',
        outcome: 'case_missing',
        next_step: 'cica_lookup',
      });
      return this.redirect(req, res, CICA_LOOKUP);
    }

    req.session.validatedPostcode = postcode;

    trackDashboardEvent(req, {
      event: 'postcode_submitted',
      attempt_id: attemptId,
      step: 'cica_postcode_verification',
      outcome: 'submitted',
      next_step: 'dashboard',
    });

    return this.redirect(req, res, DASHBOARD_URL);
  }
}
