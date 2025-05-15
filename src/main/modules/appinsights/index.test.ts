import * as appInsights from 'applicationinsights';
import config from 'config';

import { AppInsights } from './index';

jest.mock('config');

describe('AppInsights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should enable AppInsights when instrumentationKey is provided in the config', () => {
    const getMock = jest
      .spyOn(config, 'get')
      .mockReturnValue(
        'InstrumentationKey=11111111-1111-1111-1111-111111111111;IngestionEndpoint=https://uksouth-0.in.applicationinsights.azure.com/;LiveEndpoint=https://uksouth.livediagnostics.monitor.azure.com/;ApplicationId=11111111-1111-1111-1111-111111111111'
      );
    const appInsightsInstance = new AppInsights();
    appInsightsInstance.enable();
    expect(getMock).toHaveBeenCalledWith('appInsights.instrumentationKey');
    expect(appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole]).toBe(
      'sptribs-frontend'
    );
  });

  it('should not enable AppInsights when instrumentationKey is not provided in the config', () => {
    const getMock = jest.spyOn(config, 'get').mockReturnValue(undefined);

    jest.mock('applicationinsights', () => ({
      setup: jest.fn().mockReturnThis(),
      start: jest.fn(),
      defaultClient: {
        context: {
          tags: {},
          keys: {},
        },
        trackTrace: jest.fn(),
      },
    }));

    const appInsightsInstance = new AppInsights();
    appInsightsInstance.enable();

    expect(getMock).toHaveBeenCalledWith('appInsights.instrumentationKey');
    expect(require('applicationinsights').start).not.toHaveBeenCalled();
  });
});
