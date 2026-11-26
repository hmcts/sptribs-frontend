import autobind from 'autobind-decorator';
import config from 'config';
import { Response } from 'express';

import { getNextCyaStepUrl, getNextStepUrl } from '../../steps';
import {
  CHECK_YOUR_ANSWERS,
  CICA_DECISION_DATE,
  CICA_REFERENCE_NUMBER,
  CONTACT_DETAILS,
  SAVE_AND_SIGN_OUT,
  SUBJECT_CONTACT_DETAILS,
} from '../../steps/urls';
import { Case, CaseWithId, applyFormUpdatesToCase } from '../case/case';
import { CITIZEN_CIC_CREATE_CASE, CITIZEN_CIC_SUBMIT_CASE, CITIZEN_CIC_UPDATE_CASE } from '../case/definition';
import { Form, FormFields, FormFieldsFn } from '../form/Form';
import { ValidationError } from '../form/validation';

import { AppRequest } from './AppRequest';

enum noHitToSaveAndContinue {
  CITIZEN_HOME_URL = '/citizen-home',
}

@autobind
export class PostController<T extends AnyObject> {
  constructor(protected readonly fields: FormFields | FormFieldsFn) {}

  /**
   * Parse the form body and decide whether this is a save and sign out, save and continue or session time out
   */
  public async post(req: AppRequest<T>, res: Response): Promise<void> {
    const fields = typeof this.fields === 'function' ? this.fields(req.session.userCase) : this.fields;
    const form = new Form(fields);

    const { saveAndSignOut, saveBeforeSessionTimeout, _csrf, ...formData } = form.getParsedBody(req.body);
    if (req.body.saveAndSignOut) {
      await this.saveAndSignOut(req, res, formData);
    } else if (req.body.saveBeforeSessionTimeout) {
      await this.saveBeforeSessionTimeout(req, res, formData);
    } else if (req.body.cancel) {
      await this.cancel(res);
    } else {
      await this.saveAndContinue(req, res, form, formData);
    }
  }

  private async saveAndSignOut(req: AppRequest<T>, res: Response, formData: Partial<Case>): Promise<void> {
    try {
      await this.save(req, formData, CITIZEN_CIC_UPDATE_CASE);
    } catch {
      // ignore
    }
    res.redirect(withEmptyFragment(SAVE_AND_SIGN_OUT));
  }

  private async saveBeforeSessionTimeout(req: AppRequest<T>, res: Response, formData: Partial<Case>): Promise<void> {
    try {
      await this.save(req, formData, this.getEventName(req));
    } catch {
      // ignore
    }
    res.end();
  }

  private async saveAndContinue(req: AppRequest<T>, res: Response, form: Form, formData: Partial<Case>): Promise<void> {
    req.session.errors = form.getErrors(formData);
    this.filterErrorsForSaveAsDraft(req);

    const formDataToSend = applyFormUpdatesToCase(req.session.userCase, formData);

    if (req.session?.user && req.session.errors.length === 0) {
      if (!(Object.values(noHitToSaveAndContinue) as string[]).includes(req.originalUrl)) {
        const eventName = this.getEventName(req);
        if (eventName === CITIZEN_CIC_CREATE_CASE) {
          req.session.userCase = await this.createCase(req);
        } else if (eventName === CITIZEN_CIC_UPDATE_CASE) {
          req.session.userCase = await this.save(req, formDataToSend, eventName);
        }
      }
    }

    this.redirect(req, res);
  }

  async createCase(req: AppRequest<T>): Promise<CaseWithId | PromiseLike<CaseWithId>> {
    try {
      req.session.userCase = await req.locals.api.createCase(req.session.userCase);
    } catch (err) {
      req.session.errors = req.session.errors || [];
      req.session.errors.push({ errorType: 'errorSaving', propertyName: '*' });
    }
    return req.session.userCase;
  }

  private async cancel(res: Response): Promise<void> {
    const hmctsHomePage: string = config.get('services.hmctsHomePage.url');
    res.redirect(withEmptyFragment(hmctsHomePage));
  }

  protected filterErrorsForSaveAsDraft(req: AppRequest<T>): void {
    if (req.body.saveAsDraft) {
      req.session.errors = req.session.errors!.filter(
        item => item.errorType !== ValidationError.REQUIRED && item.errorType !== ValidationError.NOT_SELECTED
      );
    }
  }

  protected async save(req: AppRequest<T>, formData: Partial<Case>, eventName: string): Promise<CaseWithId> {
    try {
      const eventTrigger = await req.locals.api.getEventTrigger(req.session.userCase.id, eventName);
      req.session.userCase = await req.locals.api.triggerEvent(
        req.session.userCase.id,
        formData,
        eventName,
        eventTrigger.token
      );
    } catch (err) {
      req.locals.logger.error('Error saving', err);
      req.session.errors = req.session.errors || [];
      req.session.errors.push({ errorType: 'errorSaving', propertyName: '*' });
    }
    return req.session.userCase;
  }

  /**
   * Redirect to the next page. This function handles:
   * 1. Redirects back to current page in case of any errors
   * 2. Is aware of a sequence of pages via getNextStepUrl
   * 3. Is aware of whether we've come from a Check Your Answers page, and redirects accordingly
   * 4. Save the session
   * <br>
   * Query params (?) and fragments (#) of the current request URL are not kept.
   */
  public redirect(req: AppRequest<T>, res: Response, nextUrl?: string): void {
    if (!nextUrl) {
      if (req.session.errors?.length || req.session.fileErrors?.length) {
        nextUrl = req.path;
      } else if (req.session.isCheckYourAnswers) {
        nextUrl = getNextCyaStepUrl(req, req.session.userCase);
        if (nextUrl === CHECK_YOUR_ANSWERS) {
          req.session.isCheckYourAnswers = false;
        }
      } else {
        nextUrl = getNextStepUrl(req, req.session.userCase);
      }
    }

    req.session.save(err => {
      if (err) {
        throw err;
      }

      // When redirecting, don't keep fragment data of the page we're redirecting from.
      res.redirect(withEmptyFragment(nextUrl!));
    });
  }

  public getEventName(req: AppRequest): string {
    let eventName;
    if (req.originalUrl.startsWith(SUBJECT_CONTACT_DETAILS) && this.isBlank(req)) {
      eventName = CITIZEN_CIC_CREATE_CASE;
    } else if (
      req.originalUrl === CONTACT_DETAILS ||
      req.originalUrl === CICA_REFERENCE_NUMBER ||
      req.originalUrl === CICA_DECISION_DATE ||
      req.originalUrl.startsWith('/represent')
    ) {
      eventName = CITIZEN_CIC_UPDATE_CASE;
    } else if (req.originalUrl === CHECK_YOUR_ANSWERS) {
      eventName = CITIZEN_CIC_SUBMIT_CASE;
    }
    return eventName;
  }

  private isBlank(req: AppRequest) {
    if (req.session.userCase.id === null || req.session.userCase.id === undefined || req.session.userCase.id === '') {
      return true;
    }
  }
}

const withEmptyFragment = (url: string) => (url?.includes('#') ? url : `${url}#`);

export type AnyObject = Record<string, unknown>;
