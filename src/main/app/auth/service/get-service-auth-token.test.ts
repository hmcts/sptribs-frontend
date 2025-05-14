jest.mock('axios');
jest.mock('@hmcts/nodejs-logging');
jest.useFakeTimers();

import { Logger } from '@hmcts/nodejs-logging';

const logger = {
  info: jest.fn(),
  error: jest.fn(),
};
Logger.getLogger.mockReturnValue(logger);

import axios from 'axios';

import { getServiceAuthToken, initAuthToken } from './get-service-auth-token';

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('initAuthToken', () => {
  test('sets an interval to fetch a token', async () => {
    mockAxios.post.mockResolvedValue({ data: 'token' });
    await initAuthToken();
    expect(mockAxios.post).toHaveBeenCalled();
  });

  test('logs errors', async () => {
    mockAxios.post.mockRejectedValue({ response: { status: 500, data: 'Error' } });
    await initAuthToken();
    expect(logger.error).toHaveBeenCalledWith(500, 'Error');
  });
});

describe('getServiceAuthToken', () => {
  test('returns a token', async () => {
    mockAxios.post.mockResolvedValue({ data: 'token' });
    await initAuthToken();

    expect(getServiceAuthToken()).toBe('token');
  });
});
