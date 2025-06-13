import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import config from 'config';
import { LoggerInstance } from 'winston';

import { getServiceAuthToken } from '../auth/service/get-service-auth-token';
import { UserDetails } from '../controller/AppRequest';

import { Case, CaseWithId } from './case';
import { CaseAssignedUserRoles } from './case-roles';
import { CITIZEN_CIC_CREATE_CASE, CaseData } from './definition';
import { fromApiFormat } from './from-api-format';
import { toApiFormat } from './to-api-format';

export class CaseApi {
  readonly maxRetries: number = 3;
  readonly CASE_TYPE = config.get('caseType');

  constructor(
    private readonly client: AxiosInstance,
    private readonly logger: LoggerInstance
  ) {}

  public async findExistingUserCases(): Promise<CcdV1Response[] | false> {
    const query = {
      query: { match_all: {} },
      sort: [{ created_date: { order: 'desc' } }],
    };
    return this.findUserCases(JSON.stringify(query));
  }

  private async findUserCases(query: string): Promise<CcdV1Response[] | false> {
    try {
      const response = await this.client.post<ES<CcdV1Response>>(`/searchCases?ctid=${this.CASE_TYPE}`, query);
      return response.data.cases;
    } catch (err) {
      if (err.response?.status === 404) {
        return false;
      }
      this.logError(err);
      throw new Error('Case could not be retrieved.');
    }
  }

  public async getCaseById(caseId: string): Promise<CaseWithId> {
    try {
      const response = await this.client.get<CcdV2Response>(`/cases/${caseId}`);

      return { id: response.data.id, state: response.data.state, ...fromApiFormat(response.data.data) };
    } catch (err) {
      this.logError(err);
      throw new Error('Case could not be retrieved.');
    }
  }

  public async createCase(data: Partial<Case>): Promise<CaseWithId> {
    try {
      const tokenResponse: AxiosResponse<CcdTokenResponse> = await this.client.get(
        `/case-types/${this.CASE_TYPE}/event-triggers/${CITIZEN_CIC_CREATE_CASE}`
      );
      const token = tokenResponse.data.token;
      const event = { id: CITIZEN_CIC_CREATE_CASE };

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

  public async triggerEvent(caseId: string, data: Partial<Case>, eventName: string, retries = 0): Promise<CaseWithId> {
    try {
      const tokenResponse = await this.client.get<CcdTokenResponse>(`/cases/${caseId}/event-triggers/${eventName}`);
      const token = tokenResponse.data.token;
      const event = { id: eventName };
      const response: AxiosResponse<CcdV2Response> = await this.client.post(`/cases/${caseId}/events`, {
        event,
        data: toApiFormat(data),
        event_token: token,
      });

      return { id: response.data.id, state: response.data.state, ...fromApiFormat(response.data.data) };
    } catch (err) {
      if (retries < this.maxRetries && [409, 422, 502, 504].includes(err?.response.status)) {
        ++retries;
        this.logger.info(`retrying send event due to ${err.response.status}. this is retry no (${retries})`);
        return this.triggerEvent(caseId, data, eventName, retries);
      }
      this.logError(err);
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
  return new CaseApi(
    axios.create({
      baseURL: config.get('services.ccd.url'),
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

interface ES<T> {
  cases: T[];
  total: number;
}

export interface CcdV1Response {
  id: string;
  state: string;
  created_date: string;
  case_data: CaseData;
}

interface CcdV2Response {
  id: string;
  state: string;
  data: CaseData;
}

interface CcdTokenResponse {
  token: string;
}
