import autobind from 'autobind-decorator';
import axios, { AxiosInstance } from 'axios';
import config from 'config';
import { Response } from 'express';
import Negotiator from 'negotiator';

import { LanguageToggle } from '../../modules/i18n';
import { CommonContent, Language, generatePageContent } from '../../steps/common/common.content';
import { SPTRIBS_CASE_API_BASE_URL } from '../../steps/common/constants/apiConstants';
import { TOGGLE_SWITCH } from '../../steps/common/constants/commonConstants';
import * as Urls from '../../steps/urls';
import { COOKIES, UPLOAD_APPEAL_FORM, UPLOAD_OTHER_INFORMATION, UPLOAD_SUPPORTING_DOCUMENTS } from '../../steps/urls';
import { getServiceAuthToken } from '../auth/service/get-service-auth-token';

import { AppRequest } from './AppRequest';
import { AnyObject } from './PostController';
export type PageContent = Record<string, unknown>;
export type TranslationFn = (content: CommonContent) => PageContent;

export type AsyncTranslationFn = any;
@autobind
export class GetController {
  constructor(
    protected readonly view: string,
    protected readonly content: TranslationFn
  ) {}

  public async get(req: AppRequest, res: Response): Promise<void> {
    this.CookiePreferencesChanger(req, res);
    if (res.locals.isError || res.headersSent) {
      // If there's an async error, it will have already rendered an error page upstream,
      // so we don't want to call render again
      return;
    }

    const language = this.getPreferredLanguage(req) as Language;
    const addresses = req.session?.addresses;

    const sessionErrors = req.session?.errors || [];
    const FileErrors = req.session?.fileErrors || [];
    if (req.session?.errors || req.session?.fileErrors) {
      req.session.errors = undefined;
      req.session.fileErrors = [];
    }
    /**
     *
     *                      This util allows to delete document
     *                      the params it uses is @req and @res
     *                      This is uses generatePageContent Instance of the this GetController class
     *                      All page contents save for generating page data
     *                      the page content loads up all Page data
     *      ************************************ ************************************
     *      ************************************  ************************************
     *
     */
    const content = generatePageContent({
      language,
      pageContent: this.content,
      userCase: req.session?.userCase,
      userEmail: req.session?.user?.email,
      uploadedDocuments: req.session?.caseDocuments,
      supportingDocuments: req.session?.supportingCaseDocuments,
      otherInformation: req.session?.otherCaseInformation,
      addresses,
    });

    /**
     *
     *                      This util allows to delete document
     *                      the params it uses is @req and @res
     *                      This is uses @documentDeleteManager Instance of the this GetController class
     *      ************************************ ************************************
     *      ************************************  ************************************
     *
     */
    this.documentDeleteManager(req, res, language);
    const RedirectConditions = {
      /*************************************** query @query  ***************************/
      query: req.query.hasOwnProperty('query'),
      /*************************************** query @documentId  ***************************/
      documentId: req.query.hasOwnProperty('docId'),
      /*************************************** query @documentType  ***************************/
      documentType: req.query.hasOwnProperty('documentType'),
      /*************************************** query @analytics for monitoring and performance ***************************/
      cookieAnalytics: req.query.hasOwnProperty('analytics'),
      /*************************************** query  @apm for monitoring and performance  ***************************/
      cookieAPM: req.query.hasOwnProperty('apm'),
    };

    /**
     *
     *                      This util allows to delete document
     *                      the params it uses is @frontend-cookie-preferences
     *                      This is used to check for current cookiesPreferences
     *      ************************************ ************************************
     *      ************************************  ************************************
     *
     */
    const cookiesForPreferences = Object.prototype.hasOwnProperty.call(req.cookies, 'frontend-cookie-preferences')
      ? JSON.parse(req.cookies['frontend-cookie-preferences'])
      : {
          analytics: 'off',
          apm: 'off',
        };

    /**
     *
     *                      This util allows to delete document
     *                      the params it uses is @frontend-cookie-preferences
     *                      This is used to check for current cookiesPreferences
     *      ************************************ ************************************
     *      ************************************  ************************************
     *
     */
    let pageRenderableContents = {
      ...content,
      uploadedDocuments: req.session?.caseDocuments,
      supportingDocuments: req.session?.supportingCaseDocuments,
      otherInformation: req.session?.otherCaseInformation,
      cookiePreferences: cookiesForPreferences,
      sessionErrors,
      cookieMessage: false,
      FileErrors,
      htmlLang: language,
      isDraft: req.session?.userCase?.state ? req.session.userCase.state === '' : true,
    };

    /**
     *
     *                      This util allows saved cookies to have redirect after successfully saving
     *                      the params it uses is @frontend-cookie-preferences
     *                      This is used to check for current cookiesPreferences
     *      ************************************ ************************************
     *      ************************************  ************************************
     *
     */
    const cookieWithSaveQuery = COOKIES + '?togglesaveCookie=true';
    const checkForCookieUrlAndQuery = req.url === cookieWithSaveQuery;
    if (checkForCookieUrlAndQuery) {
      pageRenderableContents = { ...pageRenderableContents, cookieMessage: true };
    }

    const checkConditions = Object.values(RedirectConditions).includes(true);
    if (!checkConditions) {
      res.render(this.view, pageRenderableContents);
    }
  }

  private getPreferredLanguage(req: AppRequest) {
    // User selected language
    const requestedLanguage = req.query['lng'] as string;
    if (LanguageToggle.supportedLanguages.includes(requestedLanguage)) {
      return requestedLanguage;
    }

    // Saved session language
    if (req.session?.lang) {
      return req.session.lang;
    }

    // Browsers default language
    const negotiator = new Negotiator(req);
    return negotiator.language(LanguageToggle.supportedLanguages) || 'en';
  }

  public parseAndSetReturnUrl(req: AppRequest): void {
    if (req.query.returnUrl) {
      if (Object.values(Urls).find(item => item === `${req.query.returnUrl}`)) {
        req.session.returnUrl = `${req.query.returnUrl}`;
      }
    }
  }

  // public async save(req: AppRequest, formData: Partial<Case>, eventName: string): Promise<CaseWithId> {
  //   try {
  //     return await req.locals.api.triggerEvent(req.session.userCase.id, formData, eventName);
  //   } catch (err) {
  //     req.locals.logger.error('Error saving', err);
  //     req.session.errors = req.session.errors || [];
  //     req.session.errors.push({ errorType: 'errorSaving', propertyName: '*' });
  //     return req.session.userCase;
  //   }
  // }

  public CookiePreferencesChanger = (req: AppRequest, res: Response): void => {
    //?analytics=off&apm=off
    if (req.query.hasOwnProperty('analytics') && req.query.hasOwnProperty('apm')) {
      let cookieExpiryDuration = Number(config.get('cookies.expiryTime'));
      const TimeInADay = 24 * 60 * 60 * 1000;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cookieExpiryDuration = cookieExpiryDuration * TimeInADay; //cookie time in milliseconds
      const CookiePreferences = {
        analytics: '',
        apm: '',
      };
      if (req.query.hasOwnProperty('analytics')) {
        switch (req.query['analytics']) {
          case TOGGLE_SWITCH.OFF:
            CookiePreferences['analytics'] = TOGGLE_SWITCH.OFF;
            break;

          case TOGGLE_SWITCH.ON:
            CookiePreferences['analytics'] = TOGGLE_SWITCH.ON;
            break;

          default:
            CookiePreferences['analytics'] = TOGGLE_SWITCH.OFF;
        }
      }
      if (req.query.hasOwnProperty('apm')) {
        switch (req.query['apm']) {
          case TOGGLE_SWITCH.OFF:
            CookiePreferences['apm'] = TOGGLE_SWITCH.OFF;
            break;

          case TOGGLE_SWITCH.ON:
            CookiePreferences['apm'] = TOGGLE_SWITCH.ON;
            break;

          default:
            CookiePreferences['apm'] = TOGGLE_SWITCH.OFF;
        }
      }
      const cookieValue = JSON.stringify(CookiePreferences);

      res.cookie('frontend-cookie-preferences', cookieValue, {
        maxAge: cookieExpiryDuration,
        httpOnly: false,
        encode: String,
        secure: true,
      });
      const RedirectURL = COOKIES + '?togglesaveCookie=true';
      res.redirect(RedirectURL);
    }
  };

  public async documentDeleteManager(req: AppRequest, res: Response, lang: Language): Promise<void> {
    if (
      req.query.hasOwnProperty('query') &&
      req.query.hasOwnProperty('docId') &&
      req.query.hasOwnProperty('documentType')
    ) {
      const checkForDeleteQuery = req.query['query'] === 'delete';
      let errorMessage;
      if (lang === 'en') {
        errorMessage = 'Document upload or deletion has failed. Try again';
      } else {
        errorMessage = 'Mae llwytho neu ddileu ffeil wedi methu. Rhowch gynnig arall arni';
      }
      if (checkForDeleteQuery) {
        const { documentType } = req.query;
        const { docId } = req.query;
        const Headers = {
          Authorization: `Bearer ${req.session.user['accessToken']}`,
          ServiceAuthorization: getServiceAuthToken(),
        };
        const DOCUMENT_DELETEMANAGER: AxiosInstance = axios.create({
          baseURL: config.get(SPTRIBS_CASE_API_BASE_URL),
          headers: { ...Headers },
        });
        switch (documentType) {
          case 'tribunalform': {
            try {
              const baseURL = `/doc/dss-orchestration/${docId}/delete`;
              await DOCUMENT_DELETEMANAGER.delete(baseURL);
              req.session['caseDocuments'] = req.session['caseDocuments'].filter(document => {
                const { documentId } = document;
                return documentId !== docId;
              });
              req.session.save(err => {
                if (err) {
                  throw err;
                }
                res.redirect(UPLOAD_APPEAL_FORM);
              });
            } catch (error) {
              this.deleteFileError(req, UPLOAD_APPEAL_FORM, res, errorMessage);
            }
            break;
          }

          case 'supporting': {
            try {
              const baseURL = `/doc/dss-orchestration/${docId}/delete`;
              await DOCUMENT_DELETEMANAGER.delete(baseURL);
              req.session['supportingCaseDocuments'] = req.session['supportingCaseDocuments'].filter(document => {
                const { documentId } = document;
                return documentId !== docId;
              });
              req.session.save(err => {
                if (err) {
                  throw err;
                }
                res.redirect(UPLOAD_SUPPORTING_DOCUMENTS);
              });
            } catch (error) {
              this.deleteFileError(req, UPLOAD_APPEAL_FORM, res, errorMessage);
            }
            break;
          }

          case 'other': {
            try {
              const baseURL = `/doc/dss-orchestration/${docId}/delete`;
              await DOCUMENT_DELETEMANAGER.delete(baseURL);
              req.session['otherCaseInformation'] = req.session['otherCaseInformation'].filter(document => {
                const { documentId } = document;
                return documentId !== docId;
              });
              req.session.save(err => {
                if (err) {
                  throw err;
                }
                res.redirect(UPLOAD_OTHER_INFORMATION);
              });
            } catch (error) {
              this.deleteFileError(req, UPLOAD_APPEAL_FORM, res, errorMessage);
            }
            break;
          }
        }
      }
    }
  }

  private deleteFileError(
    req: AppRequest<AnyObject>,
    url: string,
    res: Response<any, Record<string, any>>,
    errorMessage?: string
  ) {
    req.session.fileErrors.push({
      text: errorMessage,
      href: '#',
    });

    req.session.save(err => {
      if (err) {
        throw err;
      }
      res.redirect(url!);
    });
  }
}
