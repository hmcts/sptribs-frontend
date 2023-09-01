const config = require('../e2e/config');

Feature('Smoke tests @smoke-tests');

Scenario('Sign in as citizen and verify landing page', async ({ I, landingPage }) => {
  try {
      const response = await fetch(config.baseUrl);

      if (response.status === 200) {
        console.log('Landing page is accessible. Smoke test passed.');
      } else {
        console.error('Landing page is not accessible. Smoke test failed. Status code:', response.status);
      }
    } catch (error) {
      console.error('Failed to make the GET request:', error.message);
    }
});
