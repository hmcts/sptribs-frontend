import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../app/controller/PostController';
import { Form, FormFields } from '../../app/form/Form';
import { startDashboardJourney } from '../dashboard-telemetry';
import { CICA_CONFIRM_NEW, CICA_LOOKUP, CICA_POSTCODE_VERIFICATION, NOT_AUTHORISED, SUBJECT_DETAILS } from '../urls';

import { form } from './content';

@autobind
export default class CCDLookupPostController extends PostController<AnyObject> {
  constructor() {
    super(form.fields);
  }

  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const journeyId = startDashboardJourney(req);

    if (req.body.cancel) {
      req.locals.logger.info('CICA dashboard journey event', {
        event: 'cica_lookup_cancelled',
        journey: 'cica_dashboard',
        journeyId,
        step: 'cica_lookup',
        outcome: 'cancelled',
        nextStep: 'subject_details',
      });
      req.body.ccdReference = '';
      return this.redirect(req, res, SUBJECT_DETAILS);
    }

    const formInstance = new Form(this.fields as FormFields);
    const formErrors = formInstance.getErrors(req.body);

    if (formErrors.length) {
      req.locals.logger.info('CICA dashboard journey event', {
        event: 'cica_lookup_validation_failed',
        journey: 'cica_dashboard',
        journeyId,
        step: 'cica_lookup',
        outcome: 'validation_failed',
        validationErrorCount: formErrors.length,
        nextStep: 'cica_lookup',
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

      req.locals.logger.info('CICA dashboard journey event', {
        event: 'cica_lookup_succeeded',
        journey: 'cica_dashboard',
        journeyId,
        step: 'cica_lookup',
        outcome: 'success',
        nextStep: 'cica_postcode_verification',
        durationMs: Date.now() - startedAt,
      });

      return this.redirect(req, res, CICA_POSTCODE_VERIFICATION);
    } catch (error: any) {
      const status = error?.response?.status;

      switch (status) {
        case 404:
          this.logLookupFailure(req, journeyId, startedAt, status, 'case_not_found', 'cica_confirm_new');
          // No case exists → offer to start new, need to update the next page too!
          req.session.userCase = this.buildEmptyCase(ccdReference);
          return this.redirect(req, res, CICA_CONFIRM_NEW);

        case 403:
          this.logLookupFailure(req, journeyId, startedAt, status, 'not_authorised', 'not_authorised');
          // Case exists but user not allowed
          // You probably want a dedicated "not authorised" page
          return this.redirect(req, res, NOT_AUTHORISED);

        case 400:
          this.logLookupFailure(req, journeyId, startedAt, status, 'invalid_reference', 'cica_lookup');
          // Invalid input (should mostly be caught by frontend validation)
          req.session.errors = [{ propertyName: 'ccdReference', errorType: 'invalid' }];
          return this.redirect(req, res, CICA_LOOKUP);

        default:
          this.logLookupFailure(req, journeyId, startedAt, status, 'upstream_error', 'cica_confirm_new');
          // 500 / unexpected → fail safe
          req.session.userCase = this.buildEmptyCase(ccdReference);
          return this.redirect(req, res, CICA_CONFIRM_NEW);
      }
    }
  }

  private logLookupFailure(
    req: AppRequest<AnyObject>,
    journeyId: string,
    startedAt: number,
    status: number | undefined,
    outcome: string,
    nextStep: string
  ): void {
    req.locals.logger.error('CICA dashboard journey event', {
      event: 'cica_lookup_failed',
      journey: 'cica_dashboard',
      journeyId,
      step: 'cica_lookup',
      outcome,
      nextStep,
      upstreamStatus: status,
      durationMs: Date.now() - startedAt,
    });
  }

  private buildEmptyCase(ccdReference: string) {
    return {
      id: '',
      state: '',
      ccdReferenceNumber: ccdReference,
    } as any;
  }
}
