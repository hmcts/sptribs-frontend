import config from 'config';
import { Application, NextFunction, Response } from 'express';

import { getRedirectUrl, getUserDetails } from '../../app/auth/user/oidc';
import { getCaseApi } from '../../app/case/CaseApi';
import { AppRequest } from '../../app/controller/AppRequest';
import { CaseDocumentManagementClient } from '../../app/document/CaseDocumentManagementClient';
import { signInNotRequired } from '../../steps/url-utils';
import { CALLBACK_URL, SIGN_IN_URL, SIGN_OUT_URL, SUBJECT_DETAILS } from '../../steps/urls';

/**
 * Adds the oidc middleware to add oauth authentication
 */
export class OidcMiddleware {
  public enableFor(app: Application): void {
    const protocol = app.locals.developmentMode ? 'http://' : 'https://';
    const port = app.locals.developmentMode ? `:${config.get('port')}` : '';
    const { errorHandler } = app.locals;

    app.get(SIGN_IN_URL, (req, res) =>
      res.redirect(getRedirectUrl(`${protocol}${res.locals.host}${port}`, CALLBACK_URL))
    );

    app.get(SIGN_OUT_URL, (req, res) => req.session.destroy(() => res.redirect('/')));

    app.get(
      CALLBACK_URL,
      errorHandler(async (req, res) => {
        if (typeof req.query.code === 'string') {
          req.session.user = await getUserDetails(`${protocol}${res.locals.host}${port}`, req.query.code, CALLBACK_URL);
          req.session.save(() => res.redirect(SUBJECT_DETAILS));
        } else {
          res.redirect(SIGN_IN_URL);
        }
      })
    );

    app.use(
      errorHandler(async (req: AppRequest, res: Response, next: NextFunction) => {
        if (req.session?.user?.roles.includes('citizen')) {
          res.locals.isLoggedIn = true;
          req.locals.api = getCaseApi(req.session.user, req.locals.logger);
          req.locals.documentApi = new CaseDocumentManagementClient(req.session.user);
          req.session.userCase = req.session.userCase || { id: '', state: 'SPTRIBS' };
          return next();
        } else if (signInNotRequired(req.path)) {
          return next();
        } else {
          res.redirect(SIGN_IN_URL);
        }
      })
    );
  }
}
