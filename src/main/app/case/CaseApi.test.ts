import axios from 'axios';
import { LoggerInstance } from 'winston';

import { UserDetails } from '../controller/AppRequest';

import { CaseApi } from './CaseApi';
import { fromApiFormat } from './from-api-format';

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
  const userDetails: UserDetails = {
    accessToken: 'string',
    id: '372ff9c1-9930-46d9-8bd2-88dd26ba2475',
    email: 'harry@hog.com',
    givenName: 'harry',
    familyName: 'potter',
    roles: ['citizen'],
  };

  const case_id = '1624351572550045';
  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
  const result = await caseApiInstance.getCaseUserRoles(case_id, userDetails.id);
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

test('Should return cases for a user ID', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  // Mock getCaseUserRoles call
  mockedAxios.get.mockResolvedValueOnce({
    data: {
      case_users: [
        {
          case_id: '1624351572550045',
          user_id: '372ff9c1-9930-46d9-8bd2-88dd26ba2475',
          case_role: '[CREATOR]',
        },
        {
          case_id: '1624351572550046',
          user_id: '372ff9c1-9930-46d9-8bd2-88dd26ba2475',
          case_role: '[CREATOR]',
        },
      ],
    },
  });

  // Mock getCaseById calls
  const mockedFromApiFormat = fromApiFormat as jest.MockedFunction<typeof fromApiFormat>;
  mockedFromApiFormat.mockReturnValueOnce({
    tribunalFormDocuments: [],
    supportingDocuments: [],
    otherInfoDocuments: [],
  } as any);

  mockedAxios.get.mockResolvedValueOnce({
    data: {
      id: '1624351572550046',
      state: 'Submitted',
      data: {
        dssCaseDataTribunalFormDocuments: [],
        dssCaseDataSupportingDocuments: [],
        dssCaseDataOtherInfoDocuments: [],
      },
    },
  });

  mockedFromApiFormat.mockReturnValueOnce({
    tribunalFormDocuments: [],
    supportingDocuments: [],
    otherInfoDocuments: [],
  } as any);

  mockedAxios.get.mockResolvedValueOnce({
    data: {
      id: '1624351572550045',
      state: 'DSS_Submitted',
      data: {
        dssCaseDataTribunalFormDocuments: [],
        dssCaseDataSupportingDocuments: [],
        dssCaseDataOtherInfoDocuments: [],
      },
    },
  });

  const user_id = '372ff9c1-9930-46d9-8bd2-88dd26ba2475';
  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
  const result = await caseApiInstance.getCasesByUserId(user_id);

  expect(result).toHaveLength(2);
  expect(result[0].id).toBe('1624351572550046');
  expect(result[1].id).toBe('1624351572550045');
  expect(mockedAxios.get).toHaveBeenCalledWith(`case-users?user_ids=${user_id}`);
});

test('Should return empty array when user has no cases', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  mockedAxios.get.mockResolvedValueOnce({
    data: {
      case_users: [],
    },
  });

  const user_id = '372ff9c1-9930-46d9-8bd2-88dd26ba2475';
  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
  const result = await caseApiInstance.getCasesByUserId(user_id);

  expect(result).toEqual([]);
});

test('Should throw error when cases could not be fetched', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  mockedAxios.get.mockRejectedValue({
    config: { method: 'GET', url: 'https://example.com/case-users' },
    request: 'mock request',
  });

  const user_id = '123';
  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
  const expectedError = 'Cases could not be fetched.';

  await expect(caseApiInstance.getCasesByUserId(user_id)).rejects.toThrow(expectedError);
});

test('Should return case by ID', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedFromApiFormat = fromApiFormat as jest.MockedFunction<typeof fromApiFormat>;

  mockedFromApiFormat.mockReturnValueOnce({
    tribunalFormDocuments: [],
    supportingDocuments: [],
    otherInfoDocuments: [],
  } as any);

  mockedAxios.get.mockResolvedValue({
    data: {
      id: '1624351572550045',
      state: 'Submitted',
      data: {
        dssCaseDataTribunalFormDocuments: [],
        dssCaseDataSupportingDocuments: [],
        dssCaseDataOtherInfoDocuments: [],
      },
    },
  });

  const case_id = '1624351572550045';
  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
  const result = await caseApiInstance.getCaseById(case_id);

  expect(result.id).toBe('1624351572550045');
  expect(result.state).toBe('Submitted');
  expect(mockedAxios.get).toHaveBeenCalledWith(`/cases/${case_id}`);
});

test('Should throw error when case could not be fetched by ID', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  mockedAxios.get.mockRejectedValue({
    config: { method: 'GET', url: 'https://example.com/cases/123' },
    request: 'mock request',
  });

  const case_id = '123';
  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
  const expectedError = 'Case could not be fetched.';

  await expect(caseApiInstance.getCaseById(case_id)).rejects.toThrow(expectedError);
});
