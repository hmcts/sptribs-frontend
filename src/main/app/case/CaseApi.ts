import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import config from 'config';
import { LoggerInstance } from 'winston';

import { CITIZEN_CIC_CREATE_CASE, CaseData, CaseworkerCICDocument, YesOrNo } from '../../app/case/definition';
import { getServiceAuthToken } from '../auth/service/get-service-auth-token';
import { UserDetails } from '../controller/AppRequest';

import { Case, CaseWithId } from './case';
import { CaseAssignedUserRoles } from './case-roles';
import { fromApiFormat } from './from-api-format';
import { toApiFormat } from './to-api-format';

export class CaseApi {
  readonly maxRetries: number = 3;
  readonly CASE_TYPE = config.get('caseType');

  constructor(
    private readonly client: AxiosInstance,
    private readonly logger: LoggerInstance,
    private readonly sptribsClient?: AxiosInstance
  ) {}

  public async createCase(data: Partial<Case>): Promise<CaseWithId> {
    try {
      const tokenResponse: AxiosResponse<CcdTokenResponse> = await this.client.get(
        `/case-types/${this.CASE_TYPE}/event-triggers/${CITIZEN_CIC_CREATE_CASE}`
      );
      const token = tokenResponse.data.token;
      const event = { id: CITIZEN_CIC_CREATE_CASE };

      data.newBundleOrderEnabled = YesOrNo.YES;
      const response = await this.client.post<CcdV2Response>(`/case-types/${this.CASE_TYPE}/cases`, {
        data: toApiFormat(data),
        event,
        event_token: token,
      });

      return { id: response.data.id, state: response.data.state, ...fromApiFormat(response.data.data) };
    } catch (err) {
      this.logError(err);
      throw new Error('Case could not be created.');
    }
  }

  public async getCaseUserRoles(caseId: string, userId: string): Promise<CaseAssignedUserRoles> {
    try {
      const response = await this.client.get<CaseAssignedUserRoles>(`case-users?case_ids=${caseId}&user_ids=${userId}`);
      return response.data;
    } catch (err) {
      this.logError(err);
      throw new Error('Case roles could not be fetched.');
    }
  }

  public async getCaseByCCDReference(ccdReference: string): Promise<CaseWithId | null> {
    if (!this.sptribsClient) {
      throw new Error('Sptribs backend client not configured');
    }

    try {
      const response = await this.sptribsClient.get<SptribsCaseResponse>(
        `/cases/cica/${encodeURIComponent(ccdReference)}`
      );
      return {
        id: response.data.id,
        state: response.data.state,
        ...fromApiFormat(response.data.data),
      };
    } catch (err) {
      this.logError(err);
      throw err; // keep original context
    }
  }

  public async validatePostcode(ccdReference: string, postcode: string): Promise<CaseWithId> {
    if (!this.sptribsClient) {
      throw new Error('Sptribs backend client not configured');
    }

    try {
      const response = await this.sptribsClient.post<SptribsCaseResponse>(
        `/cases/cica/${encodeURIComponent(ccdReference)}/validate-postcode`,
        { postcode }
      );
      return {
        id: response.data.id,
        state: response.data.state,
        ...fromApiFormat(response.data.data),
      };
    } catch (err) {
      this.logError(err);
      throw err;
    }
  }

  public async downloadDocument(ccdReference: string, documentId: string, postcode?: string): Promise<AxiosResponse> {
    if (!this.sptribsClient) {
      throw new Error('Sptribs backend client not configured');
    }

    try {
      const headers = postcode ? { 'X-Postcode': postcode } : undefined;
      return await this.sptribsClient.get(`/cases/CIC/${ccdReference}/documents/${documentId}/download`, {
        responseType: 'stream',
        headers,
      });
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status || 'unknown';
      const message = error.message || 'Unknown error';
      this.logger.error(
        `Document download failed for documentId=${documentId} (Case ${ccdReference}): status=${status}, message=${message}`
      );
      throw new Error('Document could not be downloaded.');
    }
  }

  public async getDocumentsByCaseId(ccdReference: string, postcode: string): Promise<DocumentResponse> {
    if (!this.sptribsClient) {
      throw new Error('Sptribs backend client not configured');
    }

    try {
      const response = await this.sptribsClient.get<DocumentResponse>(`/cases/CIC/${ccdReference}/documents`, {
        headers: {
          'X-Postcode': postcode,
        },
      });

      return response.data;
    } catch (err) {
      this.logError(err);
      throw err;
    }
  }

  public async getEventTrigger(caseId: string, eventName: string): Promise<CcdEventTriggerResponse> {
    try {
      const response = await this.client.get<CcdEventTriggerResponse>(`/cases/${caseId}/event-triggers/${eventName}`);
      return response.data;
    } catch (err) {
      this.logError(err);
      throw new Error('Case event trigger could not be fetched.');
    }
  }

  public async triggerEvent(
    caseId: string,
    data: Partial<Case>,
    eventName: string,
    eventToken: string,
    retries = 0
  ): Promise<CaseWithId> {
    try {
      const event = { id: eventName };
      const response: AxiosResponse<CcdV2Response> = await this.client.post(`/cases/${caseId}/events`, {
        event,
        data: toApiFormat(data),
        event_token: eventToken,
      });

      return { id: response.data.id, state: response.data.state, ...fromApiFormat(response.data.data) };
    } catch (err) {
      const status = err?.response?.status;
      if (retries < this.maxRetries && [502, 504].includes(status)) {
        ++retries;
        this.logger.info(`retrying send event due to ${status}. this is retry no (${retries})`);
        return this.triggerEvent(caseId, data, eventName, eventToken, retries);
      }
      this.logError(err);
      if (status === 409) {
        throw new Error('Case could not be updated due to a version conflict.');
      }
      throw new Error('Case could not be updated.');
    }
  }

  private logError(error: AxiosError) {
    if (error.response) {
      this.logger.error(`API Error ${error.config?.method} ${error.config?.url} ${error.response.status}`);
      this.logger.info('Response: ', error.response.data);
    } else if (error.request) {
      this.logger.error(`API Error ${error.config?.method} ${error.config?.url}`);
    } else {
      this.logger.error('API Error', error.message);
    }
  }
}

export const getCaseApi = (userDetails: UserDetails, logger: LoggerInstance): CaseApi => {
  const authHeaders = {
    Authorization: 'Bearer ' + userDetails.accessToken,
    ServiceAuthorization: getServiceAuthToken(),
    Accept: '*/*',
    'Content-Type': 'application/json',
  };

  return new CaseApi(
    axios.create({
      baseURL: config.get('services.ccd.url'),
      headers: {
        ...authHeaders,
        experimental: 'true',
      },
    }),
    logger,
    axios.create({
      baseURL: config.get('services.sptribs.url'),
      headers: authHeaders,
    })
  );
};

interface CcdV2Response {
  id: string;
  state: string;
  data: CaseData;
}

interface CcdTokenResponse {
  token: string;
}

interface CcdEventTriggerResponse extends CcdTokenResponse {
  case_details?: {
    id: string;
    state: string;
    data: CaseData;
  };
}

interface SptribsCaseResponse {
  id: string;
  state: string;
  data: CaseData;
}

interface DocumentResponse {
  latestCaseBundleDocuments: CaseworkerCICDocument[];
  contactPartiesDocuments: CaseworkerCICDocument[];
  orderAndDecisionDocuments: CaseworkerCICDocument[];
}
