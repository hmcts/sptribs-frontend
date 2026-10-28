import { Application, NextFunction } from 'express';

import { getEndSessionUrl, getRedirectUrl, getUserDetails } from '../../app/auth/user/oidc';
import { getCaseApi } from '../../app/case/CaseApi';
import { CaseDocumentManagementClient } from '../../app/document/CaseDocumentManagementClient';
import { signInNotRequired } from '../../steps/url-utils';
import { CALLBACK_URL, CICA_LOOKUP, SIGN_IN_URL, SIGN_OUT_URL } from '../../steps/urls';

import { OidcMiddleware } from '.';

jest.mock('config', () => ({ get: jest.fn(() => 3001) }));
jest.mock('../../app/auth/user/oidc');
jest.mock('../../app/case/CaseApi');
jest.mock('../../app/document/CaseDocumentManagementClient');
jest.mock('../../steps/url-utils');

const mockGetRedirectUrl = jest.mocked(getRedirectUrl);
const mockGetEndSessionUrl = jest.mocked(getEndSessionUrl);
const mockGetUserDetails = jest.mocked(getUserDetails);
const mockGetCaseApi = jest.mocked(getCaseApi);
const mockSignInNotRequired = jest.mocked(signInNotRequired);

type Handler = (req: any, res: any, next?: NextFunction) => unknown;

const setUp = (developmentMode = false) => {
  const routes: Record<string, Handler> = {};
  let middleware: Handler | undefined;

  const app = {
    locals: {
      developmentMode,
      errorHandler: (fn: Handler) => fn,
    },
    get: jest.fn((path: string, handler: Handler) => {
      routes[path] = handler;
    }),
    use: jest.fn((handler: Handler) => {
      middleware = handler;
    }),
  } as unknown as Application;

  new OidcMiddleware().enableFor(app);

  return { app, routes, middleware: middleware as Handler };
};

const mockResponse = () => ({
  locals: {} as Record<string, unknown>,
  redirect: jest.fn(),
});

const mockRequest = (overrides: Record<string, unknown> = {}) => ({
  query: {},
  path: '/first-page',
  locals: {
    logger: { info: jest.fn() },
  },
  session: {
    destroy: jest.fn(cb => cb()),
    save: jest.fn(cb => cb()),
  },
  ...overrides,
});

const user = { accessToken: 'token', id: '123', email: 'user@example.com' };

describe('OidcMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers the sign in, sign out and callback routes plus a global middleware', () => {
    const { app, routes } = setUp();

    expect(Object.keys(routes)).toEqual([SIGN_IN_URL, SIGN_OUT_URL, CALLBACK_URL]);
    expect(app.use).toHaveBeenCalledTimes(1);
  });

  describe('sign in route', () => {
    it('redirects to the IDAM login URL using https and no port in production', () => {
      mockGetRedirectUrl.mockReturnValue('https://idam/login');
      const { routes } = setUp(false);
      const res = mockResponse();
      res.locals.host = 'frontend.example.com';

      routes[SIGN_IN_URL](mockRequest(), res);

      expect(mockGetRedirectUrl).toHaveBeenCalledWith('https://frontend.example.com', CALLBACK_URL);
      expect(res.redirect).toHaveBeenCalledWith('https://idam/login');
    });

    it('uses http and the configured port in development mode', () => {
      const { routes } = setUp(true);
      const res = mockResponse();
      res.locals.host = 'localhost';

      routes[SIGN_IN_URL](mockRequest(), res);

      expect(mockGetRedirectUrl).toHaveBeenCalledWith('http://localhost:3001', CALLBACK_URL);
    });
  });

  describe('sign out route', () => {
    it('destroys the session and redirects to the end session URL', () => {
      mockGetEndSessionUrl.mockReturnValue('https://idam/logout');
      const { routes } = setUp();
      const req = mockRequest();
      const res = mockResponse();
      res.locals.host = 'frontend.example.com';

      routes[SIGN_OUT_URL](req, res);

      expect(mockGetEndSessionUrl).toHaveBeenCalledWith('https://frontend.example.com');
      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('https://idam/logout');
    });

    it('throws and does not redirect if the session cannot be destroyed', () => {
      const { routes } = setUp();
      const error = new Error('session store down');
      const req = mockRequest({ session: { destroy: jest.fn(cb => cb(error)) } });
      const res = mockResponse();

      expect(() => routes[SIGN_OUT_URL](req, res)).toThrow(error);
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe('callback route', () => {
    it('stores the user in the session and redirects to the CICA lookup page', async () => {
      mockGetUserDetails.mockResolvedValue(user as never);
      const { routes } = setUp();
      const req = mockRequest({ query: { code: 'auth-code' } });
      const res = mockResponse();
      res.locals.host = 'frontend.example.com';

      await routes[CALLBACK_URL](req, res);

      expect(mockGetUserDetails).toHaveBeenCalledWith('https://frontend.example.com', 'auth-code', CALLBACK_URL);
      expect(req.session).toHaveProperty('user', user);
      expect(req.session.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CICA_LOOKUP);
    });

    it('redirects to sign in when there is no code', async () => {
      const { routes } = setUp();
      const res = mockResponse();

      await routes[CALLBACK_URL](mockRequest(), res);

      expect(mockGetUserDetails).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(SIGN_IN_URL);
    });

    it('redirects to sign in when code is not a single string', async () => {
      const { routes } = setUp();
      const res = mockResponse();

      await routes[CALLBACK_URL](mockRequest({ query: { code: ['a', 'b'] } }), res);

      expect(mockGetUserDetails).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(SIGN_IN_URL);
    });

    it('rejects so the error handler can deal with IDAM failures', async () => {
      mockGetUserDetails.mockRejectedValue(new Error('IDAM unavailable'));
      const { routes } = setUp();
      const res = mockResponse();

      await expect(routes[CALLBACK_URL](mockRequest({ query: { code: 'auth-code' } }), res)).rejects.toThrow(
        'IDAM unavailable'
      );
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe('authentication middleware', () => {
    it('sets up APIs and a default case for a logged in user', async () => {
      const api = { getCase: jest.fn() };
      mockGetCaseApi.mockReturnValue(api as never);
      const { middleware } = setUp();
      const req = mockRequest();
      Object.assign(req.session, { user });
      const res = mockResponse();
      const next = jest.fn();

      await middleware(req, res, next);

      expect(res.locals.isLoggedIn).toBe(true);
      expect(mockGetCaseApi).toHaveBeenCalledWith(user, req.locals.logger);
      expect(req.locals).toHaveProperty('api', api);
      expect(CaseDocumentManagementClient).toHaveBeenCalledWith(user);
      expect(req.locals).toHaveProperty('documentApi', expect.any(CaseDocumentManagementClient));
      expect(req.session).toHaveProperty('userCase', { id: '', state: 'SPTRIBS' });
      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('keeps an existing case in the session', async () => {
      const { middleware } = setUp();
      const userCase = { id: '1234', state: 'Submitted' };
      const req = mockRequest();
      Object.assign(req.session, { user, userCase });
      const next = jest.fn();

      await middleware(req, mockResponse(), next);

      expect(req.session).toHaveProperty('userCase', userCase);
      expect(next).toHaveBeenCalled();
    });

    it('lets anonymous users through to pages that do not require sign in', async () => {
      mockSignInNotRequired.mockReturnValue(true);
      const { middleware } = setUp();
      const req = mockRequest({ path: '/cookies' });
      const res = mockResponse();
      const next = jest.fn();

      await middleware(req, res, next);

      expect(mockSignInNotRequired).toHaveBeenCalledWith('/cookies');
      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
      expect(res.locals.isLoggedIn).toBeUndefined();
    });

    it('redirects anonymous users to sign in for protected pages', async () => {
      mockSignInNotRequired.mockReturnValue(false);
      const { middleware } = setUp();
      const res = mockResponse();
      const next = jest.fn();

      await middleware(mockRequest(), res, next);

      expect(res.redirect).toHaveBeenCalledWith(SIGN_IN_URL);
      expect(next).not.toHaveBeenCalled();
    });

    it('treats a request with no session as anonymous', async () => {
      mockSignInNotRequired.mockReturnValue(false);
      const { middleware } = setUp();
      const res = mockResponse();

      await middleware(mockRequest({ session: undefined }), res, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(SIGN_IN_URL);
    });
  });
});
