import axios from 'axios';
import { LoggerInstance } from 'winston';

import { UserDetails } from '../controller/AppRequest';

import { CaseApi } from './CaseApi';

const { Logger } = require('@hmcts/nodejs-logging');
const logger: LoggerInstance = Logger.getLogger('app');
jest.mock('axios');

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

  try {
    await caseApiInstance.getCaseUserRoles(case_id, user_id);
  } catch (error) {
    expect(error.message).toEqual(expectedError);
  }
});
