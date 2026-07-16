import axios from 'axios';
import config from 'config';
import { LoggerInstance } from 'winston';

import * as serviceAuth from '../auth/service/get-service-auth-token';

import { CaseApi, getCaseApi } from './CaseApi';
import { fromApiFormat } from './from-api-format';
import { toApiFormat } from './to-api-format';

const { Logger } = require('@hmcts/nodejs-logging');
const logger: LoggerInstance = Logger.getLogger('app');

jest.mock('axios');
jest.mock('config');
jest.mock('../auth/service/get-service-auth-token');
jest.mock('./from-api-format');
jest.mock('./to-api-format');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedConfig = config as jest.Mocked<typeof config>;
const mockServiceAuth = serviceAuth as jest.Mocked<typeof serviceAuth>;
const mockedToApiFormat = toApiFormat as jest.MockedFunction<typeof toApiFormat>;
const mockedFromApiFormat = fromApiFormat as jest.MockedFunction<typeof fromApiFormat>;

describe('CaseApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedConfig.get.mockImplementation(key => {
      if (key === 'caseType') {
        return 'CriminalInjuriesCompensation';
      }
      if (key === 'services.ccd.url') {
        return 'http://ccd-url';
      }
      if (key === 'services.sptribs.url') {
        return 'http://sptribs-url';
      }
      return '';
    });
  });

  test('Should return case roles for userId and caseId passed', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        case_users: [
          {
            case_id: '1624351572550045',
            user_id: '372ff9c1-9930-46d9-8bd2-88dd26ba2475',
            case_role: '[APPLICANTTWO]',
          },
        ],
      },
    });

    const case_id = '1624351572550045';
    const user_id = '372ff9c1-9930-46d9-8bd2-88dd26ba2475';
    const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
    const result = await caseApiInstance.getCaseUserRoles(case_id, user_id);
    expect(result).toEqual({
      case_users: [
        {
          case_id: '1624351572550045',
          user_id: '372ff9c1-9930-46d9-8bd2-88dd26ba2475',
          case_role: '[APPLICANTTWO]',
        },
      ],
    });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'case-users?case_ids=1624351572550045&user_ids=372ff9c1-9930-46d9-8bd2-88dd26ba2475'
    );
  });

  test('Should throw error when case roles could not be fetched', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      config: { method: 'GET', url: 'https://example.com/case-users' },
      request: 'mock request',
    });

    const case_id = '12345';
    const user_id = '123';
    const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
    const expectedError = 'Case roles could not be fetched.';

    await expect(caseApiInstance.getCaseUserRoles(case_id, user_id)).rejects.toThrow(expectedError);
  });

  test('should check case access successfully', async () => {
    const mockedSptribsAxios = axios as jest.Mocked<typeof axios>;
    mockedSptribsAxios.get.mockResolvedValueOnce({ status: 200 });

    const ccdReference = '1624351572550045';
    const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger, mockedSptribsAxios);
    await expect(caseApiInstance.checkCaseAccess(ccdReference)).resolves.not.toThrow();

    expect(mockedSptribsAxios.get).toHaveBeenCalledWith(`/cases/cica/${ccdReference}/access`);
  });

  test('should throw error when case access check fails', async () => {
    const mockedSptribsAxios = axios as jest.Mocked<typeof axios>;
    mockedSptribsAxios.get.mockRejectedValueOnce({
      response: { status: 403 },
    });

    const ccdReference = '1624351572550045';
    const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger, mockedSptribsAxios);

    await expect(caseApiInstance.checkCaseAccess(ccdReference)).rejects.toMatchObject({
      response: { status: 403 },
    });
  });

  test('should throw error when sptribs client not configured for case access check', async () => {
    const ccdReference = '1624351572550045';
    const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
    const expectedError = 'Sptribs backend client not configured';

    await expect(caseApiInstance.checkCaseAccess(ccdReference)).rejects.toThrow(expectedError);
  });

  test('should return documents by case ID', async () => {
    const mockedSptribsClient = axios as jest.Mocked<typeof axios>;
    mockedSptribsClient.defaults = {
      headers: {
        Authorization: 'Bearer user-access-token',
        ServiceAuthorization: 'mock-service-token',
      },
    } as any;
    const documentsResponse = {
      contactPartiesDocuments: [],
      latestCaseBundleDocuments: [],
      orderAndDecisionDocuments: [],
    };

    mockedSptribsClient.get.mockResolvedValueOnce({
      data: documentsResponse,
    });

    const caseId = '1624351572550045';
    const caseApiInstance = new CaseApi(mockedAxios, logger, mockedSptribsClient);
    const result = await caseApiInstance.getDocumentsByCaseId(caseId, 'SW1A 1AA');

    expect(result).toEqual(documentsResponse);
    expect(mockedSptribsClient.get).toHaveBeenCalledWith(`/cases/CIC/${caseId}/documents`, {
      headers: {
        'X-Postcode': 'SW1A 1AA',
      },
    });
  });

  test('Should throw error when documents could not be fetched by ID', async () => {
    const mockedSptribsClient = axios as jest.Mocked<typeof axios>;
    mockedSptribsClient.defaults = {
      headers: {
        Authorization: 'Bearer user-access-token',
        ServiceAuthorization: 'mock-service-token',
      },
    } as any;
    const mockError = {
      config: { method: 'GET', url: 'https://example.com/cases/CIC/123/documents' },
      request: 'mock request',
    };

    mockedSptribsClient.get.mockRejectedValueOnce(mockError);

    const case_id = '123';
    const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger, mockedSptribsClient);

    await expect(caseApiInstance.getDocumentsByCaseId(case_id, 'SW1A 1AA')).rejects.toEqual(mockError);
  });

  test('should download document with postcode', async () => {
    const mockedSptribsClient = axios as jest.Mocked<typeof axios>;
    mockedSptribsClient.defaults = {
      headers: {
        Authorization: 'Bearer user-access-token',
        ServiceAuthorization: 'mock-service-token',
      },
    } as any;
    const response = {
      data: 'stream',
      headers: {
        'content-type': 'application/pdf',
      },
    };

    mockedSptribsClient.get.mockResolvedValue(response);

    const caseApi = new CaseApi(mockedAxios, logger, mockedSptribsClient);
    const resultWithPostcode = await caseApi.downloadDocument('1740138704453399', '1234', 'SW1A 1AA');

    expect(resultWithPostcode).toEqual(response);
    expect(mockedSptribsClient.get).toHaveBeenCalledWith('/cases/CIC/1740138704453399/documents/1234/download', {
      responseType: 'stream',
      headers: {
        'X-Postcode': 'SW1A 1AA',
      },
    });
  });

  test('should throw error when postcode is missing', async () => {
    const mockedSptribsClient = axios as jest.Mocked<typeof axios>;
    const caseApi = new CaseApi(mockedAxios, logger, mockedSptribsClient);
    await expect(caseApi.downloadDocument('1740138704453399', '1234', '')).rejects.toThrow(
      'Postcode is required to download documents'
    );
  });

  test('should throw error when document download fails', async () => {
    const mockedSptribsClient = axios as jest.Mocked<typeof axios>;
    mockedSptribsClient.defaults = {
      headers: {
        Authorization: 'Bearer user-access-token',
        ServiceAuthorization: 'mock-service-token',
      },
    } as any;
    mockedSptribsClient.get.mockRejectedValueOnce({
      message: 'boom',
      response: {
        status: 500,
      },
    });

    const caseApi = new CaseApi(mockedAxios, logger, mockedSptribsClient);

    await expect(caseApi.downloadDocument('1740138704453399', '1234', 'SW1A 1AA')).rejects.toThrow(
      'Document could not be downloaded.'
    );
  });

  test('should return event trigger', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        token: 'abc123',
      },
    });

    const caseApi = new CaseApi(mockedAxios, logger);
    const result = await caseApi.getEventTrigger('123', 'submit');

    expect(result).toEqual({
      token: 'abc123',
    });
    expect(mockedAxios.get).toHaveBeenCalledWith('/cases/123/event-triggers/submit');
  });

  test('should throw error when event trigger could not be fetched', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      config: {
        method: 'GET',
        url: '/cases/123/event-triggers/submit',
      },
      request: 'mock request',
    });

    const caseApi = new CaseApi(mockedAxios, logger);

    await expect(caseApi.getEventTrigger('123', 'submit')).rejects.toThrow('Case event trigger could not be fetched.');
  });

  test('should create case successfully', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { token: 'mock-token' },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id: '12345',
        state: 'Draft',
        data: { mockData: 'mock' },
      },
    });

    const caseDataInput = { subjectFullName: 'John Doe' };
    const caseDataApi = { dssCaseDataSubjectFullName: 'John Doe' };
    mockedToApiFormat.mockReturnValueOnce(caseDataApi as any);
    mockedFromApiFormat.mockReturnValueOnce({ subjectFullName: 'John Doe' } as any);

    const caseApiInstance = new CaseApi(mockedAxios, logger);
    const result = await caseApiInstance.createCase(caseDataInput);

    expect(result).toEqual({
      id: '12345',
      state: 'Draft',
      subjectFullName: 'John Doe',
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/case-types/CriminalInjuriesCompensation/event-triggers/citizen-cic-create-dss-application'
    );
    expect(mockedAxios.post).toHaveBeenCalledWith('/case-types/CriminalInjuriesCompensation/cases', {
      data: caseDataApi,
      event: { id: 'citizen-cic-create-dss-application' },
      event_token: 'mock-token',
    });
    expect(mockedToApiFormat).toHaveBeenCalledWith(caseDataInput);
    expect(mockedFromApiFormat).toHaveBeenCalledWith({ mockData: 'mock' });
  });

  test('should throw error when case creation fails', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      message: 'boom',
    });

    const caseApiInstance = new CaseApi(mockedAxios, logger);
    await expect(caseApiInstance.createCase({})).rejects.toThrow('Case could not be created.');
  });

  test('should trigger event successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id: '12345',
        state: 'Submitted',
        data: { mockData: 'mock' },
      },
    });

    const caseDataInput = { subjectFullName: 'John Doe' };
    const caseDataApi = { dssCaseDataSubjectFullName: 'John Doe' };
    mockedToApiFormat.mockReturnValueOnce(caseDataApi as any);
    mockedFromApiFormat.mockReturnValueOnce({ subjectFullName: 'John Doe' } as any);

    const caseApiInstance = new CaseApi(mockedAxios, logger);
    const result = await caseApiInstance.triggerEvent('12345', caseDataInput, 'submit', 'mock-token');

    expect(result).toEqual({
      id: '12345',
      state: 'Submitted',
      subjectFullName: 'John Doe',
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/cases/12345/events', {
      event: { id: 'submit' },
      data: caseDataApi,
      event_token: 'mock-token',
    });
  });

  test('should throw conflict error on 409 status', async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 409 } });

    const caseDataInput = { subjectFullName: 'John Doe' };
    const caseDataApi = { dssCaseDataSubjectFullName: 'John Doe' };
    mockedToApiFormat.mockReturnValue(caseDataApi as any);

    const caseApiInstance = new CaseApi(mockedAxios, logger);
    await expect(caseApiInstance.triggerEvent('12345', caseDataInput, 'submit', 'mock-token')).rejects.toThrow(
      'Case could not be updated due to a version conflict.'
    );
  });

  test('should throw general error on other failed status', async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 500 } });

    const caseDataInput = { subjectFullName: 'John Doe' };
    const caseDataApi = { dssCaseDataSubjectFullName: 'John Doe' };
    mockedToApiFormat.mockReturnValue(caseDataApi as any);

    const caseApiInstance = new CaseApi(mockedAxios, logger);
    await expect(caseApiInstance.triggerEvent('12345', caseDataInput, 'submit', 'mock-token')).rejects.toThrow(
      'Case could not be updated.'
    );
  });

  test('should return configured CaseApi instance via getCaseApi', () => {
    const userDetails = { accessToken: 'user-access-token' } as any;
    mockServiceAuth.getServiceAuthToken.mockReturnValueOnce('mock-service-token');

    const mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    const api = getCaseApi(userDetails, logger);

    expect(api).toBeInstanceOf(CaseApi);
    expect(mockedAxios.create).toHaveBeenCalledTimes(2);

    expect(mockedAxios.create).toHaveBeenNthCalledWith(1, {
      baseURL: 'http://ccd-url',
      headers: {
        Authorization: 'Bearer user-access-token',
        ServiceAuthorization: 'mock-service-token',
        Accept: '*/*',
        'Content-Type': 'application/json',
        experimental: 'true',
      },
    });

    expect(mockedAxios.create).toHaveBeenNthCalledWith(2, {
      baseURL: 'http://sptribs-url',
      headers: {
        Authorization: 'Bearer user-access-token',
        ServiceAuthorization: 'mock-service-token',
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    });
  });

  test('Should log error when error.response exists', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      config: { method: 'GET', url: 'https://example.com/case-users' },
      response: {
        status: 500,
        data: 'some response data',
      },
    });

    const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
    const logErrorSpy = jest.spyOn(logger, 'error');
    const logInfoSpy = jest.spyOn(logger, 'info');

    await expect(caseApiInstance.getCaseUserRoles('12345', '123')).rejects.toThrow();

    expect(logErrorSpy).toHaveBeenCalledWith('API Error GET https://example.com/case-users 500');
    expect(logInfoSpy).toHaveBeenCalledWith('Response: ', 'some response data');
  });

  test('Should log error when error.request exists but no response', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      config: { method: 'GET', url: 'https://example.com/case-users' },
      request: 'mock-request-object',
    });

    const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
    const logErrorSpy = jest.spyOn(logger, 'error');

    await expect(caseApiInstance.getCaseUserRoles('12345', '123')).rejects.toThrow();

    expect(logErrorSpy).toHaveBeenCalledWith('API Error GET https://example.com/case-users');
  });

  test('Should log error when neither response nor request exists', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      message: 'Generic Network Error',
    });

    const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
    const logErrorSpy = jest.spyOn(logger, 'error');

    await expect(caseApiInstance.getCaseUserRoles('12345', '123')).rejects.toThrow();

    expect(logErrorSpy).toHaveBeenCalledWith('API Error', 'Generic Network Error');
  });
});
