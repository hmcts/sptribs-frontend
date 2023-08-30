import { Request, Response } from 'express';

import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import { SIGN_IN_URL } from '../../../steps/urls';

/*** query params for @edgeCaseType */
const edgeCaseTypeQueryValidations = (req: Request, res: Response, loginURL, SystemContent, ToggleLanguage) => {
  res.render('landing.njk', { loginURL, content: SystemContent, ToggleLanguage });
};

export const UpdateLandingController = (req: Request, res: Response): void => {
  const loginURL = SIGN_IN_URL;
  if (req.session.hasOwnProperty('user')) {
    res.redirect('https://dss-update-case.aat.platform.hmcts.net/dss-update/start');
  } else {
    try {
      const resourceLoader = new ResourceReader();
      resourceLoader.Loader('landing');
      const Translations = resourceLoader.getFileContents().translations;

      /**
       * @SystemLanguage
       */
      const en = Translations.en;
      const cy = Translations.cy;

      let SystemContent = en;
      let ToggleLanguage = 'cy';

      if (req.query.hasOwnProperty('lang')) {
        if (req.query['lang'] === 'en') {
          SystemContent = en;
          ToggleLanguage = 'cy';
        } else if (req.query['lang'] === 'cy') {
          SystemContent = cy;
          ToggleLanguage = 'en';
        } else {
          SystemContent = en;
          ToggleLanguage = 'cy';
        }
      }

      edgeCaseTypeQueryValidations(req, res, loginURL, SystemContent, ToggleLanguage);
    } catch (exception) {
      res.render('error');
    }
  }
};
