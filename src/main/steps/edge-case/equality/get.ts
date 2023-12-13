import autobind from 'autobind-decorator';
import axios, { AxiosResponse } from 'axios';
import config from 'config';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';

import { getServiceAuthToken } from '../../../app/auth/service/get-service-auth-token';
import { mapCaseData } from '../../../app/case/CaseApi';
import { CaseDate } from '../../../app/case/case';
import { AppRequest } from '../../../app/controller/AppRequest';
import { SPTRIBS_CASE_API_BASE_URL } from '../../common/constants/apiConstants';
import { CHECK_YOUR_ANSWERS } from '../../urls';

import { createToken } from './createToken';

@autobind
export default class PCQGetController {
  public async get(req: AppRequest, res: Response): Promise<void> {
    const pcqUrl: string = config.get('services.equalityAndDiversity.url');
    const pcqEnabled: boolean = String(config.get('services.equalityAndDiversity.enabled')) === 'true';
    console.log(`PCQ enabled? - ${pcqEnabled}`);
    if (!pcqEnabled) {
      console.log('PCQ disabled - here');
      return res.redirect(CHECK_YOUR_ANSWERS);
    }

    const ageCheckValue = this.calculateAgeCheckParam(req.session.userCase.subjectDateOfBirth);
    if (!req.session.userCase.pcqId && ageCheckValue !== 0) {
      try {
        const response: AxiosResponse<StatusResponse> = await axios.get(pcqUrl + '/health');
        const equalityHealth = response.data && response.data.status === 'UP';
        if (equalityHealth) {
          req.session.userCase.pcqId = uuid();
          const updateCaseResponse: AxiosResponse<StatusResponse> = await this.updateCase(req);
          if (updateCaseResponse && updateCaseResponse.status === 200) {
            const pcqParams = this.gatherPcqParams(req, ageCheckValue);
            const path: string = config.get('services.equalityAndDiversity.path');
            const qs = Object.keys(pcqParams)
              .map(key => `${key}=${pcqParams[key]}`)
              .join('&');
            res.redirect(`${pcqUrl}${path}?${qs}`);
          } else {
            return res.redirect(CHECK_YOUR_ANSWERS);
          }
        } else {
          return res.redirect(CHECK_YOUR_ANSWERS);
        }
      } catch (err) {
        res.redirect(CHECK_YOUR_ANSWERS);
      }
    } else {
      res.redirect(CHECK_YOUR_ANSWERS);
    }
  }

  private gatherPcqParams(req: AppRequest, ageCheckValue: number) {
    const developmentMode = process.env.NODE_ENV === 'development';
    const protocol = developmentMode ? 'http://' : '';
    const host = req.headers['x-forwarded-host'] || req.hostname;
    const port = developmentMode ? `:${config.get('port')}` : '';
    const pcqParams = {
      actor: 'APPLICANT',
      serviceId: 'SpecialTribunals_CIC',
      ccdCaseId: req.session.userCase.id,
      pcqId: req.session.userCase.pcqId,
      partyId: req.session.userCase.subjectEmailAddress,
      language: req.session.lang ? req.session.lang : 'en',
      returnUrl: `${protocol}${host}${port}${CHECK_YOUR_ANSWERS}`,
      ageCheck: ageCheckValue.toString(),
    };
    const tokenKey: string = config.get('services.equalityAndDiversity.tokenKey');
    pcqParams['token'] = createToken(pcqParams, tokenKey);
    pcqParams.partyId = encodeURIComponent(pcqParams.partyId);
    return pcqParams;
  }

  private calculateAgeCheckParam(dateOfBirth: CaseDate) {
    const dobPlus18 = new Date(Number(dateOfBirth.year) + 18, Number(dateOfBirth.month) - 1, Number(dateOfBirth.day));
    const dobPlus16 = new Date(Number(dateOfBirth.year) + 16, Number(dateOfBirth.month) - 1, Number(dateOfBirth.day));
    const today = new Date();
    if (today.getTime() >= dobPlus18.getTime()) {
      return 2;
    } else if (today.getTime() >= dobPlus16.getTime()) {
      return 1;
    } else {
      return 0;
    }
  }

  private async updateCase(req: AppRequest) {
    const CaseId = req.session.userCase['id'];
    const updateUrl = `/case/dss-orchestration/${CaseId}/update?event=UPDATE`;
    const Headers = {
      Authorization: `Bearer ${req.session.user['accessToken']}`,
      ServiceAuthorization: getServiceAuthToken(),
    };
    const TribunalFormDocuments = req.session['caseDocuments'].map(document => {
      const { url, fileName, documentId, binaryUrl } = document;
      return {
        id: documentId,
        value: {
          documentLink: {
            document_url: url,
            document_filename: fileName,
            document_binary_url: binaryUrl,
          },
        },
      };
    });

    let SupportingDocuments = [];
    if (req.session.supportingCaseDocuments !== undefined) {
      SupportingDocuments = req.session['supportingCaseDocuments'].map(document => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const { url, fileName, documentId, binaryUrl } = document;
        return {
          id: documentId,
          value: {
            documentLink: {
              document_url: url,
              document_filename: fileName,
              document_binary_url: binaryUrl,
            },
          },
        };
      });
    }
    let OtherInfoDocuments = [];
    if (req.session.otherCaseInformation !== undefined) {
      OtherInfoDocuments = req.session['otherCaseInformation'].map(document => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const { url, fileName, documentId, binaryUrl } = document;
        return {
          id: documentId,
          value: {
            documentLink: {
              document_url: url,
              document_filename: fileName,
              document_binary_url: binaryUrl,
            },
          },
        };
      });
    }
    const CaseData = mapCaseData(req);
    const requestBody = {
      ...CaseData,
      TribunalFormDocuments,
      SupportingDocuments,
      OtherInfoDocuments,
    };
    return axios
      .create({
        baseURL: config.get(SPTRIBS_CASE_API_BASE_URL),
        headers: Headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })
      .put(updateUrl, requestBody);
  }
}

export interface StatusResponse {
  status: 'UP' | 'DOWN' | undefined;
}
