const { recorder, output } = require('codeceptjs');
const lodash = require('lodash');
const retryableErrors = [
  'Execution context was destroyed',
  'Node is either not visible or not an HTMLElement',
  'Node is detached from document',
  'net::ERR_ABORTED',
];

module.exports = class HooksHelpers extends Helper {
  getHelper() {
    return this.helpers['Playwright'] || this.helpers['Puppeteer'] || this.helpers['WebDriver'];
  }

  _beforeSuite() {
    recorder.retry({
      retries: 10,
      minTimeout: 1000,
      when: (err) => lodash.some(retryableErrors, (retryableError) => err.message.indexOf(retryableError) > -1),
    });
  }

  async _afterStep(step) {
    const helper = this.getHelper();
    if (step.name === 'attachFile') {
      output.debug('Waiting for file to finish "Uploading..."');
      await helper.waitForInvisible('//*[contains(text(), "Uploading...")]', 20);
    }
  }
};
