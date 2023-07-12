/* eslint-disable @typescript-eslint/no-shadow */
import Axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import config from 'config';
import { LoggerInstance } from 'winston';

import {
  APPLICATION_JSON,
  AUTHORIZATION,
  BEARER,
  CONTENT_TYPE,
  CONTEXT_PATH,
  CREATE_API_PATH,
  SPTRIBS_CASE_API_BASE_URL,
  UPDATE_API_PATH,
} from '../../steps/common/constants/apiConstants';
import { EMPTY, FORWARD_SLASH, SPACE } from '../../steps/common/constants/commonConstants';
import { getServiceAuthToken } from '../auth/service/get-service-auth-token';
import { AppRequest, UserDetails } from '../controller/AppRequest';

import { Case, CaseWithId } from './case';
import { CaseAssignedUserRoles } from './case-roles';
import { CaseData, YesOrNo } from './definition';
import { toApiDate, toApiFormat } from './to-api-format';

export class CaseApi {
  /**
   *
   * @param axios
   * @param logger
   */
  constructor(private readonly axios: AxiosInstance, private readonly logger: LoggerInstance) {}

  /**
   *
   * @returns
   */
  public async getOrCreateCase(): Promise<any> {
    return { id: '', state: 'SPTRIBS' };
  }

  /**
   *
   * @param caseId
   * @returns
   */
  public async getCaseById(): Promise<CaseWithId> {
    return new Promise(() => {
      null;
    });
  }

  /**
   *
   * @param req
   * @param userDetails
   * @param  formData
   * @returns
   */
  public async updateCase(req: AppRequest, userDetails: UserDetails, eventName: string): Promise<any> {
    Axios.defaults.headers.put[CONTENT_TYPE] = APPLICATION_JSON;
    Axios.defaults.headers.put[AUTHORIZATION] = BEARER + SPACE + userDetails.accessToken;
    try {
      if (req.session.userCase.id === EMPTY) {
        throw new Error('Error in updating case, case id is missing');
      }
      const url: string = config.get(SPTRIBS_CASE_API_BASE_URL);
      const CaseDocuments = req.session['caseDocuments'].map(document => {
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
      const SupportingDocuments = req.session['supportingCaseDocuments'].map(document => {
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
      const OtherInformation = req.session['otherCaseInformation'].map(document => {
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

      const data = {
        ...mapCaseData(req),
        tribunalFormDocuments: CaseDocuments,
        supportingDocuments: SupportingDocuments,
        otherInformationDocuments: OtherInformation,
      };
      const res: AxiosResponse<CreateCaseResponse> = await Axios.put(
        url + CONTEXT_PATH + FORWARD_SLASH + req.session.userCase.id + UPDATE_API_PATH,
        data,
        {
          params: { event: eventName },
        }
      );
      if (res.status === 200) {
        return req.session.userCase;
      } else {
        throw new Error('Error in updating case');
      }
    } catch (err) {
      this.logError(err);
      throw new Error('Error in updating case');
    }
  }

  /**
   *
   * @param req
   * @param userDetails
   * @param  formData
   * @returns
   */
  public async createCaseNew(req: AppRequest, userDetails: UserDetails): Promise<any> {
    try {
      const url: string = config.get(SPTRIBS_CASE_API_BASE_URL);
      const headers = {
        CONTENT_TYPE: APPLICATION_JSON,
        Authorization: BEARER + SPACE + userDetails.accessToken,
        ServiceAuthorization: getServiceAuthToken(),
      };
      const res: AxiosResponse<CreateCaseResponse> = await Axios.post(
        url + CONTEXT_PATH + CREATE_API_PATH,
        mapCaseData(req),
        { headers }
      );
      if (res.status === 200) {
        req.session.userCase.id = res.data.id;
        return req.session.userCase;
      } else {
        throw new Error(
          'Error in creating case. URL:' +
            url +
            CONTEXT_PATH +
            CREATE_API_PATH +
            ' response.status:' +
            res.status +
            ' res.data:' +
            JSON.stringify(res.data, null, 2)
        );
      }
    } catch (err) {
      this.logError(err);
      throw new Error('Error in creating case');
    }
  }

  /**
   *
   * @param caseId
   * @param userId
   * @returns
   */
  public async getCaseUserRoles(caseId: string, userId: string): Promise<CaseAssignedUserRoles> {
    try {
      const response = await this.axios.get<CaseAssignedUserRoles>(`case-users?case_ids=${caseId}&user_ids=${userId}`);
      return response.data;
    } catch (err) {
      this.logError(err);
      throw new Error('Case roles could not be fetched.');
    }
  }

  /**
   *
   * @param caseId
   * @param data
   * @param eventName
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async sendEvent(caseId: string, data: Partial<CaseData>, eventName: string): Promise<CaseWithId> {
    return new Promise(() => {
      null;
    });
  }

  /**
   *
   * @param caseId
   * @param userData
   * @param eventName
   * @returns
   */
  public async triggerEvent(caseId: string, userData: Partial<Case>, eventName: string): Promise<CaseWithId> {
    const data = toApiFormat(userData);
    return this.sendEvent(caseId, data, eventName);
  }

  /**
   *
   * @param error
   */
  private logError(error: AxiosError) {
    if (error.response) {
      this.logger.error(`API Error ${error.config.method} ${error.config.url} ${error.response.status}`);
      this.logger.info('Response: ', error.response.data);
    } else if (error.request) {
      this.logger.error(`API Error ${error.config.method} ${error.config.url}`);
    } else {
      this.logger.error('API Error', error.message);
    }
  }
}

/**
 *
 * @param userDetails
 * @param logger
 * @returns
 */
export const getCaseApi = (userDetails: UserDetails, logger: LoggerInstance): CaseApi => {
  return new CaseApi(
    Axios.create({
      baseURL: config.get('services.sptribs.url'),
      headers: {
        Authorization: 'Bearer ' + userDetails.accessToken,
        ServiceAuthorization: getServiceAuthToken(),
        experimental: 'true',
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    }),
    logger
  );
};

interface CreateCaseResponse {
  status: string;
  id: string;
}

export const mapCaseData = (req: AppRequest): any => {
  const data = {
    //CaseTypeOfApplication: req.session['edgecaseType'],
    // Hardcode for now
    CaseTypeOfApplication: 'CIC',
    SubjectFullName: req.session.userCase.subjectFullName,
    SubjectDateOfBirth: toApiDate(req.session.userCase.subjectDateOfBirth),
    SubjectEmailAddress: req.session.userCase.subjectEmailAddress,
    SubjectContactNumber: req.session.userCase.subjectContactNumber,
    SubjectAgreeContact: checkboxConverter(req.session.userCase.subjectAgreeContact),
    Representation: req.session.userCase.representation,
    RepresentationQualified: req.session.userCase.representationQualified,
    RepresentativeFullName: req.session.userCase.representativeFullName,
    RepresentativeOrganisationName: req.session.userCase.representativeOrganisationName,
    RepresentativeContactNumber: req.session.userCase.representativeContactNumber,
    RepresentativeEmailAddress: req.session.userCase.representativeEmailAddress,
    PcqId: req.session.userCase.pcqId,
    documentRelevance: req.session.userCase.documentRelevance,
    additionalInformation: req.session.userCase.additionalInformation,
  };
  return data;
};

const checkboxConverter = (value: string | undefined) => {
  if (value === YesOrNo.YES) {
    return YesOrNo.YES;
  } else {
    return YesOrNo.NO;
  }
};
