import * as appInsights from 'applicationinsights';
import config from 'config';

import { AppInsights } from './index';

jest.mock('config');

describe('AppInsights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should enable AppInsights when instrumentationKey is provided in the config', () => {
    const getMock = jest.spyOn(config, 'get').mockReturnValue('instrumentationKey123');
    const appInsightsInstance = new AppInsights();
    appInsightsInstance.enable();
    expect(getMock).toHaveBeenCalledWith('appInsights.instrumentationKey');
    expect(appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole]).toBe(
      'sptribs-frontend'
    );
  });

  it('should not enable AppInsights when instrumentationKey is not provided in the config', () => {
    const getMock = jest.spyOn(config, 'get').mockReturnValue(undefined);
    const setupMock = jest.spyOn(appInsights, 'setup');

    const appInsightsInstance = new AppInsights();
    appInsightsInstance.enable();

    expect(getMock).toHaveBeenCalledWith('appInsights.instrumentationKey');
    expect(setupMock).not.toHaveBeenCalled();
  });
});
