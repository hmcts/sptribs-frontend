import { Response } from 'express';

import { AppRequest } from '../../app/controller/AppRequest';
import { SUBJECT_DETAILS } from '../urls';

export class HomeGetController {
  public get(req: AppRequest, res: Response): void {
    const isFirstQuestionComplete = true;
    res.redirect(pageRedirectSwitch(isFirstQuestionComplete));
  }
}

const pageRedirectSwitch = (isFirstQuestionComplete: boolean) => {
  return isFirstQuestionComplete ? SUBJECT_DETAILS : SUBJECT_DETAILS;
};
