import autobind from 'autobind-decorator';
import config from 'config';
import { Response } from 'express';

import { getNextStepUrl } from '../../steps';
import {
  CHECK_YOUR_ANSWERS,
  CICA_REFERENCE_NUMBER,
  CONTACT_DETAILS,
  SAVE_AND_SIGN_OUT,
  SUBJECT_CONTACT_DETAILS,
} from '../../steps/urls';
import { Case, CaseWithId } from '../case/case';
import { CITIZEN_CIC_CREATE_CASE, CITIZEN_CIC_SUBMIT_CASE, CITIZEN_CIC_UPDATE_CASE, YesOrNo } from '../case/definition';
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
    res.redirect(SAVE_AND_SIGN_OUT);
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
    Object.assign(req.session.userCase, formData);
    req.session.errors = form.getErrors(formData);

    this.filterErrorsForSaveAsDraft(req);

    if (req.session?.user && req.session.errors.length === 0) {
      if (!(Object.values(noHitToSaveAndContinue) as string[]).includes(req.originalUrl)) {
        const eventName = this.getEventName(req);
        if (eventName === CITIZEN_CIC_CREATE_CASE) {
          req.session.userCase = await this.createCase(req);
        } else if (eventName === CITIZEN_CIC_UPDATE_CASE) {
          formData.representation = req.session.userCase.representation === YesOrNo.YES ? YesOrNo.YES : YesOrNo.NO;
          req.session.userCase = await this.save(req, formData, eventName);
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
    res.redirect(hmctsHomePage);
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
      req.session.userCase = await req.locals.api.triggerEvent(req.session.userCase.id, formData, eventName);
    } catch (err) {
      req.locals.logger.error('Error saving', err);
      req.session.errors = req.session.errors || [];
      req.session.errors.push({ errorType: 'errorSaving', propertyName: '*' });
    }
    return req.session.userCase;
  }

  public redirect(req: AppRequest<T>, res: Response, nextUrl?: string): void {
    if (!nextUrl) {
      nextUrl = req.session.errors?.length ? req.url : getNextStepUrl(req, req.session.userCase);
    }

    req.session.save(err => {
      if (err) {
        throw err;
      }
      res.redirect(nextUrl!);
    });
  }

  public getEventName(req: AppRequest): string {
    let eventName;
    if (req.originalUrl.startsWith(SUBJECT_CONTACT_DETAILS) && this.isBlank(req)) {
      eventName = CITIZEN_CIC_CREATE_CASE;
    } else if (
      req.originalUrl === CONTACT_DETAILS ||
      req.originalUrl === CICA_REFERENCE_NUMBER ||
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

export type AnyObject = Record<string, unknown>;
