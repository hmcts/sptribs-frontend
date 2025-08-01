import autobind from 'autobind-decorator';
import axios, { AxiosResponse } from 'axios';
import config from 'config';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';

import { CaseDate } from '../../../app/case/case';
import { AppRequest } from '../../../app/controller/AppRequest';
import { CHECK_YOUR_ANSWERS } from '../../urls';

import { createToken } from './createToken';

@autobind
export default class PCQGetController {
  public async get(req: AppRequest, res: Response): Promise<void> {
    const pcqUrl: string = config.get('services.equalityAndDiversity.url');
    const pcqEnabled: boolean = String(config.get('services.equalityAndDiversity.enabled')) === 'true';
    if (!pcqEnabled) {
      return res.redirect(CHECK_YOUR_ANSWERS);
    }

    const ageCheckValue = this.calculateAgeCheckParam(req.session.userCase.subjectDateOfBirth);
    if (!req.session.userCase.pcqId && ageCheckValue !== 0) {
      try {
        const response: AxiosResponse<StatusResponse> = await axios.get(pcqUrl + '/health');
        const equalityHealth = response.data && response.data.status === 'UP';
        if (equalityHealth) {
          req.session.userCase.pcqId = uuid();
          const pcqParams = this.gatherPcqParams(req, res, ageCheckValue);
          const path: string = config.get('services.equalityAndDiversity.path');
          const qs = Object.keys(pcqParams)
            .map(key => `${key}=${pcqParams[key]}`)
            .join('&');
          res.redirect(`${pcqUrl}${path}?${qs}`);
        } else {
          res.redirect(CHECK_YOUR_ANSWERS);
        }
      } catch (err) {
        res.redirect(CHECK_YOUR_ANSWERS);
      }
    } else {
      res.redirect(CHECK_YOUR_ANSWERS);
    }
  }

  private gatherPcqParams(req: AppRequest, res: Response, ageCheckValue: number) {
    const tokenKey: string = config.get('services.equalityAndDiversity.tokenKey');
    const developmentMode = process.env.NODE_ENV === 'development';
    const protocol = developmentMode ? 'http://' : '';
    const port = developmentMode ? `:${config.get('port')}` : '';
    const lang = req.session.lang === 'cy' ? 'cy' : 'en';
    const ccdCaseId = parseInt(req.session.userCase.id);

    const pcqParams = {
      actor: 'APPLICANT',
      serviceId: 'SpecialTribunals_CIC',
      ccdCaseId: ccdCaseId.toString(),
      pcqId: req.session.userCase.pcqId,
      partyId: req.session.userCase.subjectEmailAddress,
      language: lang,
      returnUrl: `${protocol}${res.locals.host}${port}${CHECK_YOUR_ANSWERS}`,
      ageCheck: ageCheckValue.toString(),
    };
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
}

export interface StatusResponse {
  status: 'UP' | 'DOWN' | undefined;
}
