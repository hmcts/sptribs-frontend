import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { GetController } from '../../app/controller/GetController';
import { createDashboardAttemptId, trackDashboardEvent } from '../dashboard-telemetry';

import { generateContent } from './content';

@autobind
export default class PostcodeErrorGetController extends GetController {
  constructor() {
    super('postcode-error/template', generateContent);
  }

  public async get(req: AppRequest, res: Response): Promise<void> {
    const attemptId = createDashboardAttemptId();
    await super.get(req, res);

    trackDashboardEvent(req, {
      event: 'postcode_error_shown',
      attempt_id: attemptId,
      step: 'postcode_error',
      outcome: 'shown',
    });
  }
}
