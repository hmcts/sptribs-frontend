import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import config from 'config';
import { LoggerInstance } from 'winston';

import { getServiceAuthToken } from '../auth/service/get-service-auth-token';
import { UserDetails } from '../controller/AppRequest';

import { Case, CaseWithId } from './case';
import { CaseAssignedUserRoles } from './case-roles';
import { CITIZEN_CIC_CREATE_CASE, CaseData, YesOrNo } from './definition';
import { fromApiFormat } from './from-api-format';
import { toApiFormat } from './to-api-format';

export class CaseApi {
  readonly maxRetries: number = 3;
  readonly CASE_TYPE = config.get('caseType');

  constructor(
    private readonly client: AxiosInstance,
    private readonly logger: LoggerInstance
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

  public async getCasesByUserId(userId: string): Promise<CaseWithId[]> {
    try {
      // Use case-users endpoint to find all cases for a user
      const response = await this.client.get<CaseAssignedUserRoles>(`case-users?user_ids=${userId}`);
      const caseIds = response.data.case_users?.map(cu => cu.case_id) || [];

      if (caseIds.length === 0) {
        return [];
      }

      // Fetch all cases by their IDs
      const casePromises = caseIds.map(caseId => this.getCaseById(caseId));
      const cases = await Promise.all(casePromises);

      // Filter by case type and sort by last modified date (most recent first)
      return cases
        .filter(caseData => caseData && caseData.id)
        .sort((a, b) => {
          // Sort by case ID descending (assuming higher IDs are more recent)
          // If cases have last_modified dates, use those instead
          return parseInt(b.id) - parseInt(a.id);
        });
    } catch (err) {
      this.logError(err);
      throw new Error('Cases could not be fetched.');
    }
  }

  public async getCaseById(caseId: string): Promise<CaseWithId> {
    try {
      const response = await this.client.get<CcdV2Response>(`/cases/${caseId}`);
      return { id: response.data.id, state: response.data.state, ...fromApiFormat(response.data.data) };
    } catch (err) {
      this.logError(err);
      throw new Error('Case could not be fetched.');
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
