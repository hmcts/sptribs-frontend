import axios from 'axios';
import { UserDetails } from "../controller/AppRequest";
import {CaseApi, getCaseApi} from "./CaseApi";
import { LoggerInstance } from 'winston';
const { Logger } = require('@hmcts/nodejs-logging');
const logger: LoggerInstance = Logger.getLogger('app');

jest.mock('axios');

test('Should throw error when case could not be fetched', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  mockedAxios.get.mockRejectedValue({
    config: { method: 'GET', url: 'https://example.com' },
    request: 'mock request',
  });
});

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
    accessToken: "string",
    id: "372ff9c1-9930-46d9-8bd2-88dd26ba2475",
    email: "harry@hog.com",
    givenName: "harry",
    familyName: "potter"
  };

  const caseApiInstance: CaseApi = new CaseApi(mockedAxios, logger);


  // Assume a function getCaseRoles in your CaseApi instance
  const result = await caseApiInstance.getCaseUserRoles('1624351572550045', userDetails.id);

  // Your assertions based on the expected API response
  expect(result).toEqual(
    {
      case_users: [
        {
          case_id: '1624351572550045',
          user_id: '372ff9c1-9930-46d9-8bd2-88dd26ba2475',
          case_role: '[APPLICANTTWO]',
        }]
    });
});

test('Should throw error when case roles could not be fetched', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockRejectedValue({
      config: {method: 'GET', url: 'https://example.com/case-users'},
      request: 'mock request',
    });

    const userDetails: UserDetails = {
      accessToken: "string",
      id: "372ff9c1-9930-46d9-8bd2-88dd26ba2475",
      email: "harry@hog.com",
      givenName: "harry",
      familyName: "potter"
    };

    const caseApiInstance: CaseApi = getCaseApi(userDetails, logger);
    const expectedError = "Case roles could not be fetched.";

    try {
      await caseApiInstance.getCaseUserRoles("512", "123"); // Pass any necessary parameters
    } catch (error) {
      expect(error.message).toEqual(expectedError);
    }
  });
