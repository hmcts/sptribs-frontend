jest.mock('config');

const mockOn = jest.fn();

const mockRedisClient = {
  connect: () =>
    new Promise(resolve =>
      resolve({
        test: () => jest.fn(),
      })
    ),
  on: mockOn,
};

const mockCreateClient = jest.fn(() => mockRedisClient);
jest.mock('redis', () => {
  return {
    __esModule: true,
    createClient: mockCreateClient,
  };
});

const mockSessionFileStore = jest.fn();
jest.mock('session-file-store', () => {
  return {
    __esModule: true,
    default: jest.fn(() => jest.fn().mockImplementation(() => mockSessionFileStore)),
  };
});

const mockRedisStore = jest.fn();
jest.mock('connect-redis', () => {
  return {
    __esModule: true,
    RedisStore: jest.fn(() => jest.fn().mockImplementation(() => mockRedisStore)),
  };
});

const mockSession = jest.fn(() => 'MOCK session');
jest.mock('express-session', () => {
  return {
    __esModule: true,
    default: mockSession,
  };
});

jest.mock('cookie-parser', () => {
  return {
    __esModule: true,
    default: jest.fn(() => 'MOCKED cookie-parser'),
  };
});

import config from 'config';
import { Application } from 'express';
import { LoggerInstance } from 'winston';

import { SessionStorage } from '.';

describe('session', () => {
  let mockApp;
  let mockLogger: LoggerInstance;

  beforeEach(() => {
    config.get = jest.fn().mockImplementationOnce(() => 'MOCK_HIDDEN_VALUE'); // silly fortify false positive
    mockApp = {
      locals: {
        developmentMode: false,
      },
      set: jest.fn(),
      use: jest.fn(callback => callback),
    } as unknown as Application;
    mockLogger = {
      error: jest.fn().mockImplementation((message: string) => message),
    } as unknown as LoggerInstance;

    new SessionStorage().enableFor(mockApp, mockLogger);
  });

  test('should use cookieParser middleware', () => {
    expect(mockApp.use).toHaveBeenNthCalledWith(1, 'MOCKED cookie-parser');
  });

  test('should use session middleware with FileStore', () => {
    expect(mockSession).toHaveBeenCalledWith({
      name: 'sptribs-frontend-session',
      resave: false,
      saveUninitialized: false,
      secret: 'MOCK_HIDDEN_VALUE',
      cookie: {
        httpOnly: true,
        maxAge: 1260000,
        secure: true,
      },
      rolling: true,
      store: mockSessionFileStore,
    });
    expect(mockApp.use).toHaveBeenNthCalledWith(2, 'MOCK session');
  });

  describe('when redis host is available in config', () => {
    beforeEach(() => {
      config.get = jest
        .fn()
        .mockImplementationOnce(() => 'MOCK_HIDDEN_VALUE')
        .mockImplementationOnce(() => 'MOCK_REDIS_HOST')
        .mockImplementationOnce(() => 'MOCK_REDIS_KEY');
      mockApp = {
        use: jest.fn(callback => callback),
        set: jest.fn(),
        locals: {},
      } as unknown as Application;
      mockLogger = {
        error: jest.fn().mockImplementation((message: string) => message),
      } as unknown as LoggerInstance;

      new SessionStorage().enableFor(mockApp, mockLogger);
    });

    test('should create redis client', () => {
      expect(mockCreateClient).toHaveBeenCalledWith({
        socket: {
          host: 'MOCK_REDIS_HOST',
          port: 6380,
          tls: true,
          connectTimeout: 15000,
        },
        password: 'MOCK_REDIS_KEY',
      });
    });

    test('should use session middleware with SessionStore', () => {
      expect(mockApp.locals.redisClient).toEqual(mockRedisClient);
      expect(mockApp.use).toHaveBeenNthCalledWith(2, 'MOCK session');
    });
  });
});

describe('SessionStorage getStore error handling', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });
  it('should call logger.error when redis client emits error', () => {
    // Arrange
    const mockError = new Error('Redis failure');
    const mockLogger = { error: jest.fn() };

    jest.mock('redis', () => ({
      __esModule: true,
      createClient: mockCreateClient,
    }));

    config.get = jest
      .fn()
      .mockImplementationOnce(() => 'MOCK_SECRET')
      .mockImplementationOnce(() => 'MOCK_REDIS_HOST')
      .mockImplementationOnce(() => 'MOCK_REDIS_KEY');

    const mockApp = {
      use: jest.fn(callback => callback),
      set: jest.fn(),
      locals: {},
    } as unknown as Application;

    // Act
    new SessionStorage().enableFor(mockApp, mockLogger as any);

    // Simulate error event registration
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
    const errorHandler = mockOn.mock.calls.find(call => call[0] === 'error')[1];
    errorHandler(mockError);

    // Assert
    expect(mockLogger.error).toHaveBeenCalledWith('Redis Client Error', mockError);
  });
});
