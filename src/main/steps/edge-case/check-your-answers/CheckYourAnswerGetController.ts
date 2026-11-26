import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../../app/controller/AppRequest';
import { GetController } from '../../../app/controller/GetController';

@autobind
export default class CheckYourAnswerGetController extends GetController {
  public async get(req: AppRequest, res: Response): Promise<void> {
    if ('equality-asked' in req.query) {
      req.session.userCase.equalityAsked = true;
    }

    await super.get(req, res);
  }
}
