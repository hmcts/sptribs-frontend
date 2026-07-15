import axios from 'axios';
import { LoggerInstance } from 'winston';

import { CaseApi } from './CaseApi';

const { Logger } = require('@hmcts/nodejs-logging');
const logger: LoggerInstance = Logger.getLogger('app');
jest.mock('axios');
jest.mock('./from-api-format');

test('Should return case roles for userId and caseId passed', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  mockedAxios.get.mockResolvedValue({
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
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  mockedAxios.get.mockRejectedValue({
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
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedSptribsAxios = axios as jest.Mocked<typeof axios>;

  mockedSptribsAxios.get.mockResolvedValueOnce({ status: 200 });

  const ccdReference = '1624351572550045';
  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger, mockedSptribsAxios);
  await expect(caseApiInstance.checkCaseAccess(ccdReference)).resolves.not.toThrow();

  expect(mockedSptribsAxios.get).toHaveBeenCalledWith(`/cases/cica/${ccdReference}/access`);
});

test('should throw error when case access check fails', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
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
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  const ccdReference = '1624351572550045';
  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
  const expectedError = 'Sptribs backend client not configured';

  await expect(caseApiInstance.checkCaseAccess(ccdReference)).rejects.toThrow(expectedError);
});

test('should return documents by case ID', async () => {
  const mockedCcdClient = axios as jest.Mocked<typeof axios>;
  const mockedSptribsClient = axios as jest.Mocked<typeof axios>;

  const documentsResponse = {
    contactPartiesDocuments: [],
    latestCaseBundleDocuments: [],
    orderAndDecisionDocuments: [],
  };

  mockedSptribsClient.get.mockResolvedValue({
    data: documentsResponse,
  });

  const caseId = '1624351572550045';

  const caseApiInstance = new CaseApi(mockedCcdClient, logger, mockedSptribsClient);

  const result = await caseApiInstance.getDocumentsByCaseId(caseId, 'SW1A 1AA');

  expect(result).toEqual(documentsResponse);

  expect(mockedSptribsClient.get).toHaveBeenCalledWith(`/cases/CIC/${caseId}/documents`, {
    headers: {
      'X-Postcode': 'SW1A 1AA',
    },
  });
});

test('Should throw error when documents could not be fetched by ID', async () => {
  const mockedCcdClient = axios as jest.Mocked<typeof axios>;
  const mockedSptribsClient = axios as jest.Mocked<typeof axios>;

  const mockError = {
    config: { method: 'GET', url: 'https://example.com/cases/CIC/123/documents' },
    request: 'mock request',
  };

  mockedSptribsClient.get.mockRejectedValue(mockError);

  const case_id = '123';
  const caseApiInstance: CaseApi = new CaseApi(mockedCcdClient, logger, mockedSptribsClient);

  await expect(caseApiInstance.getDocumentsByCaseId(case_id, 'SW1A 1AA')).rejects.toEqual(mockError);
});

test('should download document with and without postcode', async () => {
  const mockedCcdClient = axios as jest.Mocked<typeof axios>;
  const mockedSptribsClient = axios as jest.Mocked<typeof axios>;

  const response = {
    data: 'stream',
    headers: {
      'content-type': 'application/pdf',
    },
  };

  mockedSptribsClient.get.mockResolvedValue(response);

  const caseApi = new CaseApi(mockedCcdClient, logger, mockedSptribsClient);

  const resultWithoutPostcode = await caseApi.downloadDocument('1740138704453399', '1234');

  expect(resultWithoutPostcode).toEqual(response);
  expect(mockedSptribsClient.get).toHaveBeenCalledWith('/cases/CIC/1740138704453399/documents/1234/download', {
    responseType: 'stream',
    headers: undefined,
  });

  const resultWithPostcode = await caseApi.downloadDocument('1740138704453399', '1234', 'SW1A 1AA');

  expect(resultWithPostcode).toEqual(response);
  expect(mockedSptribsClient.get).toHaveBeenCalledWith('/cases/CIC/1740138704453399/documents/1234/download', {
    responseType: 'stream',
    headers: {
      'X-Postcode': 'SW1A 1AA',
    },
  });
});

test('should throw error when document download fails', async () => {
  const mockedCcdClient = axios as jest.Mocked<typeof axios>;
  const mockedSptribsClient = axios as jest.Mocked<typeof axios>;

  mockedSptribsClient.get.mockRejectedValue({
    message: 'boom',
    response: {
      status: 500,
    },
  });

  const caseApi = new CaseApi(mockedCcdClient, logger, mockedSptribsClient);

  await expect(caseApi.downloadDocument('1740138704453399', '1234')).rejects.toThrow(
    'Document could not be downloaded.'
  );
});

test('should return event trigger', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  mockedAxios.get.mockResolvedValue({
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
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  mockedAxios.get.mockRejectedValue({
    config: {
      method: 'GET',
      url: '/cases/123/event-triggers/submit',
    },
    request: 'mock request',
  });

  const caseApi = new CaseApi(mockedAxios, logger);

  await expect(caseApi.getEventTrigger('123', 'submit')).rejects.toThrow('Case event trigger could not be fetched.');
});
