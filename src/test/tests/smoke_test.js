const config = require('../config');

Feature('Smoke tests @smoke-tests @cross-browser').retry(1);

Scenario('Send a get request to check the service is up.', async () => {
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
