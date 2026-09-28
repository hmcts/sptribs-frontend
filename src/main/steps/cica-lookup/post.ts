import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../app/controller/PostController';
import { Form, FormFields } from '../../app/form/Form';
import {
  classifyDashboardError,
  createDashboardAttemptId,
  startDashboardJourney,
  trackDashboardEvent,
} from '../dashboard-telemetry';
import { CICA_CONFIRM_NEW, CICA_LOOKUP, CICA_POSTCODE_VERIFICATION, NOT_AUTHORISED, SUBJECT_DETAILS } from '../urls';

import { form } from './content';

@autobind
export default class CCDLookupPostController extends PostController<AnyObject> {
  constructor() {
    super(form.fields);
  }

  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    startDashboardJourney(req);
    const attemptId = createDashboardAttemptId();

    if (req.body.cancel) {
      trackDashboardEvent(req, {
        event: 'cica_lookup_cancelled',
        attempt_id: attemptId,
        step: 'cica_lookup',
        outcome: 'cancelled',
        next_step: 'subject_details',
      });
      req.body.ccdReference = '';
      return this.redirect(req, res, SUBJECT_DETAILS);
    }

    const formInstance = new Form(this.fields as FormFields);
    const formErrors = formInstance.getErrors(req.body);

    if (formErrors.length) {
      trackDashboardEvent(req, {
        event: 'cica_lookup_validation_failed',
        attempt_id: attemptId,
        step: 'cica_lookup',
        outcome: 'validation_failed',
        validation_error_count: formErrors.length,
        next_step: 'cica_lookup',
      });
      req.session.errors = formErrors;
      return this.redirect(req, res, CICA_LOOKUP);
    }

    const ccdReference = req.body.ccdReference as string;
    const startedAt = Date.now();

    req.session.validatedPostcode = undefined;

    try {
      await req.locals.api.checkCaseAccess(ccdReference);

      // Access granted (200 OK) -> we update session.userCase with the inputted value ourselves.
      req.session.userCase = {
        id: ccdReference,
        state: '',
        ccdReferenceNumber: ccdReference,
      } as any;

      const durationMs = Date.now() - startedAt;
      trackDashboardEvent(req, {
        event: 'cica_lookup_succeeded',
        attempt_id: attemptId,
        step: 'cica_lookup',
        outcome: 'success',
        next_step: 'cica_postcode_verification',
        duration_ms: durationMs,
        upstream_duration_ms: durationMs,
      });

      return this.redirect(req, res, CICA_POSTCODE_VERIFICATION);
    } catch (error: any) {
      const status = error?.response?.status;

      switch (status) {
        case 404:
          this.logLookupFailure(req, attemptId, startedAt, status, 'case_not_found', 'cica_confirm_new');
          // No case exists → offer to start new, need to update the next page too!
          req.session.userCase = this.buildEmptyCase(ccdReference);
          return this.redirect(req, res, CICA_CONFIRM_NEW);

        case 403:
          this.logLookupFailure(req, attemptId, startedAt, status, 'not_authorised', 'not_authorised');
          // Case exists but user not allowed
          // You probably want a dedicated "not authorised" page
          return this.redirect(req, res, NOT_AUTHORISED);

        case 400:
          this.logLookupFailure(req, attemptId, startedAt, status, 'invalid_reference', 'cica_lookup');
          // Invalid input (should mostly be caught by frontend validation)
          req.session.errors = [{ propertyName: 'ccdReference', errorType: 'invalid' }];
          return this.redirect(req, res, CICA_LOOKUP);

        default:
          this.logLookupFailure(req, attemptId, startedAt, status, classifyDashboardError(error), 'cica_confirm_new');
          // 500 / unexpected → fail safe
          req.session.userCase = this.buildEmptyCase(ccdReference);
          return this.redirect(req, res, CICA_CONFIRM_NEW);
      }
    }
  }

  private logLookupFailure(
    req: AppRequest<AnyObject>,
    attemptId: string,
    startedAt: number,
    status: number | undefined,
    outcome: string,
    nextStep: string
  ): void {
    const durationMs = Date.now() - startedAt;
    trackDashboardEvent(
      req,
      {
        event: 'cica_lookup_failed',
        attempt_id: attemptId,
        step: 'cica_lookup',
        outcome,
        next_step: nextStep,
        upstream_status: status,
        duration_ms: durationMs,
        upstream_duration_ms: durationMs,
      },
      'error'
    );
  }

  private buildEmptyCase(ccdReference: string) {
    return {
      id: '',
      state: '',
      ccdReferenceNumber: ccdReference,
    } as any;
  }
}
