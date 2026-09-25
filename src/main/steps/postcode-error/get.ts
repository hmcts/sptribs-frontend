import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { GetController } from '../../app/controller/GetController';
import { getDashboardJourneyId } from '../dashboard-telemetry';

import { generateContent } from './content';

@autobind
export default class PostcodeErrorGetController extends GetController {
  constructor() {
    super('postcode-error/template', generateContent);
  }

  public async get(req: AppRequest, res: Response): Promise<void> {
    await super.get(req, res);

    req.locals.logger.info('CICA dashboard journey event', {
      event: 'postcode_error_shown',
      journey: 'cica_dashboard',
      journeyId: getDashboardJourneyId(req),
      step: 'postcode_error',
      outcome: 'shown',
    });
  }
}
