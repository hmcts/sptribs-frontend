import express, { Express } from 'express';
import helmet from 'helmet';

import { Helmet, HelmetConfig } from './index';

describe('Helmet', () => {
  let mockApp: Express;
  let contentSecurityPolicySpy: jest.SpyInstance;
  let referrerPolicySpy: jest.SpyInstance;

  beforeEach(() => {
    mockApp = express();
    mockApp.locals = {
      developmentMode: true, // Set to true if needed for testing
    };

    contentSecurityPolicySpy = jest.spyOn(helmet, 'contentSecurityPolicy');
    referrerPolicySpy = jest.spyOn(helmet, 'referrerPolicy');
  });

  afterEach(() => {
    mockApp = {} as Express;
    jest.restoreAllMocks();
  });

  it('should enable helmet and set content security policy and referrer policy', () => {
    const config: HelmetConfig = {
      referrerPolicy: 'same-origin',
    };

    const helmetInstance = new Helmet(config);
    helmetInstance.enableFor(mockApp);

    expect(contentSecurityPolicySpy).toHaveBeenCalled();
    expect(referrerPolicySpy).toHaveBeenCalled();
  });

  it('should throw an error when referrer policy is not provided', () => {
    const config: HelmetConfig = {
      referrerPolicy: '', // Empty value to trigger the error
    };

    const helmetInstance = new Helmet(config);
    expect(() => {
      helmetInstance.enableFor(mockApp);
    }).toThrow('Referrer policy configuration is required');
  });
});
