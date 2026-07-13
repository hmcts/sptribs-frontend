import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { GetController } from '../../app/controller/GetController';
import { CICA_LOOKUP } from '../urls';

import { generateContent } from './content';

@autobind
export default class PostcodeVerificationGetController extends GetController {
  constructor() {
    super('cica-postcode-verification/template', generateContent);
  }

  public async get(req: AppRequest, res: Response): Promise<void> {
    const sessionCase = req.session.userCase;

    if (!sessionCase?.id) {
      return res.redirect(CICA_LOOKUP);
    }

    await super.get(req, res);
  }
}
