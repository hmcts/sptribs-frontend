import autobind from 'autobind-decorator';
import axios, { AxiosInstance, RawAxiosRequestHeaders } from 'axios';
import config from 'config';
import { Response } from 'express';

import { getServiceAuthToken } from '../../../app/auth/service/get-service-auth-token';
import { mapCaseData } from '../../../app/case/CaseApi';
import { AppRequest } from '../../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../../app/controller/PostController';
import { FormFields, FormFieldsFn } from '../../../app/form/Form';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import { SPTRIBS_CASE_API_BASE_URL } from '../../../steps/common/constants/apiConstants';
import { APPLICATION_SUBMITTED, CHECK_YOUR_ANSWERS } from '../../urls';

export const CASE_API_URL: string = config.get(SPTRIBS_CASE_API_BASE_URL);

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

  public caseSubmit = (BASEURL: string, header: RawAxiosRequestHeaders): AxiosInstance => {
    return axios.create({
      baseURL: BASEURL,
      headers: header,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
  };

  /**
   *
   * @param req
   * @param res
   */
  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const CaseId = req.session.userCase['id'];
    const baseURL = '/case/dss-orchestration/' + CaseId + '/update?event=SUBMIT';
    const Headers = {
      Authorization: `Bearer ${req.session.user['accessToken']}`,
      ServiceAuthorization: getServiceAuthToken(),
    };
    try {
      const CaseData = mapCaseData(req);
      const responseBody = {
        ...CaseData,
      };
      await this.caseSubmit(CASE_API_URL, Headers).put(baseURL, responseBody);
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
