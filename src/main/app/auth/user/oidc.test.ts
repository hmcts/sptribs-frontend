import axios, { AxiosStatic } from 'axios';

import { CALLBACK_URL } from '../../../steps/urls';

import { getEndSessionUrl, getRedirectUrl, getSystemUser, getUserDetails } from './oidc';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<AxiosStatic>;

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwiZ2l2ZW5fbmFtZSI6IkpvaG4iLCJmYW1pbHlfbmFtZSI6IkRvcmlhbiIsInVpZCI6IjEyMyIsInJvbGVzIjpbImNpdGl6ZW4iXX0.rxjx6XsSNNYavVppwKAqWiNWT_GxN4vjVzdLRe6q14I';

describe('getRedirectUrl', () => {
  test('should create a valid URL to redirect to the new login screen', () => {
    expect(getRedirectUrl('http://localhost', CALLBACK_URL)).toBe(
      'https://idam-web-public.aat.platform.hmcts.net/o/authorize?client_id=sptribs-frontend&response_type=code&redirect_uri=http://localhost/receiver&scope=openid%20profile%20roles'
    );
  });
});

describe('getEndSessionUrl', () => {
  test('should create a valid URL to redirect to the IDAM endSession endpoint', () => {
    expect(getEndSessionUrl('http://localhost')).toBe(
      'https://idam-web-public.aat.platform.hmcts.net/o/endSession?post_logout_redirect_uri=http://localhost/login'
    );
  });
});

describe('getUserDetails', () => {
  test('should exchange a code for a token and decode a JWT to get the user details', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: token,
        id_token: token,
      },
    });

    const result = await getUserDetails('http://localhost', '123', CALLBACK_URL);
    expect(result).toStrictEqual({
      accessToken: token,
      email: 'test@test.com',
      givenName: 'John',
      familyName: 'Dorian',
      id: '123',
      roles: ['citizen'],
    });
  });
});

describe('getCaseWorkerUser', () => {
  test('should retrieve a token with caseworker username and password then decode the JWT to get user details', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: token,
        id_token: token,
      },
    });

    const result = await getSystemUser();
    expect(result).toStrictEqual({
      accessToken: token,
      email: 'test@test.com',
      givenName: 'John',
      familyName: 'Dorian',
      id: '123',
      roles: ['citizen'],
    });
  });
});
