import * as appInsights from 'applicationinsights';
import config from 'config';

export class AppInsights {
  enable(): void {
    if (config.get('appInsights.instrumentationKey')) {
      appInsights
        .setup(config.get('appInsights.instrumentationKey'))
        .setSendLiveMetrics(true)
        .setAutoCollectConsole(true, true)
        .setAutoCollectExceptions(true)
        .start();

      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'sptribs-frontend';
      appInsights.defaultClient.trackTrace({ message: 'App insights activated' });
    }
  }
}
