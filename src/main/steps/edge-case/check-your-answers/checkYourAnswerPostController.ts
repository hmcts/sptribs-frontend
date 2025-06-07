import autobind from 'autobind-decorator';
import { Response } from 'express';

import { CITIZEN_CIC_SUBMIT_CASE, LanguagePreference } from '../../../app/case/definition';
import { AppRequest } from '../../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../../app/controller/PostController';
import { FormFields, FormFieldsFn } from '../../../app/form/Form';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import { APPLICATION_SUBMITTED, CHECK_YOUR_ANSWERS } from '../../urls';

/**
 * ****** File Upload validations Message
 */
type CaseSubmitErrorTranslatables = {
  SUBMIT_ERROR?: string;
};

export class FileValidations {
  /**
   *
   * @param req
   * @returns
   */

  static readonly ResourceReaderContents = (req: AppRequest<AnyObject>): CaseSubmitErrorTranslatables => {
    let SystemContent: any | CaseSubmitErrorTranslatables = {};
    const SystemLangauge = req.session['lang'];
    const resourceLoader = new ResourceReader();
    resourceLoader.Loader('check-your-answers');
    const ErrorInLangauges = resourceLoader.getFileContents().errors;
    switch (SystemLangauge) {
      case 'en':
        SystemContent = ErrorInLangauges.en;
        break;
      case 'cy':
        SystemContent = ErrorInLangauges.cy;
        break;
      default:
        SystemContent = ErrorInLangauges.en;
    }
    return SystemContent;
  };
}

@autobind
export default class submitCaseController extends PostController<AnyObject> {
  constructor(protected readonly fields: FormFields | FormFieldsFn) {
    super(fields);
  }

  /**
   *
   * @param req
   * @param res
   */
  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    try {
      const languagePreference = req.session?.lang === 'cy' ? LanguagePreference.WELSH : LanguagePreference.ENGLISH;
      const data = { languagePreference };
      await req.locals.api.triggerEvent(req.session.userCase.id, data, CITIZEN_CIC_SUBMIT_CASE);
      res.redirect(APPLICATION_SUBMITTED);
    } catch (error) {
      const errorMessage = FileValidations.ResourceReaderContents(req).SUBMIT_ERROR;
      this.caseSubmitError(req, res, errorMessage);
    }
  }

  private caseSubmitError(req: AppRequest<AnyObject>, res: Response<any, Record<string, any>>, errorMessage?: string) {
    req.session.fileErrors.push({
      text: errorMessage,
      href: '#',
    });

    this.redirect(req, res, CHECK_YOUR_ANSWERS);
  }
}
