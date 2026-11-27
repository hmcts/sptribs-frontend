import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { GetController } from '../../app/controller/GetController';

import { generateContent } from './content';

@autobind
export default class CCDLookupGetController extends GetController {
  constructor() {
    super('cica-lookup/template', generateContent);
  }

  public async get(req: AppRequest, res: Response): Promise<void> {
    res.locals.ccdReferenceForRetry = req.session.ccdReferenceForRetry;
    delete req.session.ccdReferenceForRetry;
    await super.get(req, res);
  }
}
