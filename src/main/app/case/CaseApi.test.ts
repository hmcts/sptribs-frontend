import axios from 'axios';
import { LoggerInstance } from 'winston';

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

test('Should return case by CICA reference', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedSptribsAxios = axios as jest.Mocked<typeof axios>;
  const mockedFromApiFormat = fromApiFormat as jest.MockedFunction<typeof fromApiFormat>;

  mockedFromApiFormat.mockReturnValueOnce({
    tribunalFormDocuments: [],
    supportingDocuments: [],
    otherInfoDocuments: [],
  } as any);

  mockedSptribsAxios.get.mockResolvedValueOnce({
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

  const cicaReference = 'X12345';
  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger, mockedSptribsAxios);
  const result = await caseApiInstance.getCaseByCicaReference(cicaReference);

  expect(result).not.toBeNull();
  expect(result!.id).toBe('1624351572550045');
  expect(result!.state).toBe('Submitted');
  expect(mockedSptribsAxios.get).toHaveBeenCalledWith(`/cases/cica/${cicaReference}`);
});

test('Should return null when no case found by CICA reference', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedSptribsAxios = axios as jest.Mocked<typeof axios>;

  mockedSptribsAxios.get.mockRejectedValueOnce({
    response: { status: 404 },
    config: { method: 'GET', url: 'https://example.com/cases/cica/X99999' },
  });

  const cicaReference = 'X99999';
  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger, mockedSptribsAxios);
  const result = await caseApiInstance.getCaseByCicaReference(cicaReference);

  expect(result).toBeNull();
});

test('Should throw error when case lookup by CICA reference fails', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedSptribsAxios = axios as jest.Mocked<typeof axios>;

  mockedSptribsAxios.get.mockRejectedValueOnce({
    response: { status: 500 },
    config: { method: 'GET', url: 'https://example.com/cases/cica/X12345' },
  });

  const cicaReference = 'X12345';
  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger, mockedSptribsAxios);
  const expectedError = 'Case could not be fetched.';

  await expect(caseApiInstance.getCaseByCicaReference(cicaReference)).rejects.toThrow(expectedError);
});

test('Should throw error when sptribs client not configured', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  const cicaReference = 'X12345';
  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);
  const expectedError = 'Sptribs backend client not configured';

  await expect(caseApiInstance.getCaseByCicaReference(cicaReference)).rejects.toThrow(expectedError);
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
