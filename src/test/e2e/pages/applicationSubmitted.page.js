const { I } = inject();

const config = require('../config.js');
const pa11yHelper = require('../helpers/pa11y_helper.js');
const applicationSubmittedDetails = require('../fixtures/content/applicationSubmitted_content.js')

module.exports = {

  closeAndExitButton: 'a[role=\'button\']',

  async checkPageLoads(pa11y_helper) {
    await I.see(applicationSubmittedDetails.pagetitle, '.govuk-panel__title');
    I.see(applicationSubmittedDetails.subtitle1, 'div[class=\'govuk-panel__body\'] strong');
    I.see(applicationSubmittedDetails.textonpage1, '.govuk-body');
    I.see(applicationSubmittedDetails.textonpage2, '.govuk-body');
    I.see(applicationSubmittedDetails.subtitle2, '#govuk-notification-banner-title');
    I.see(applicationSubmittedDetails.textonpage3);
    I.see(applicationSubmittedDetails.textonpage4, '.govuk-notification-banner__content');
    I.see(applicationSubmittedDetails.textonpage5, '.govuk-notification-banner__content');
    I.see(applicationSubmittedDetails.button, 'a[role=\'button\']');
    if (pa11y_helper) {
      pa11yHelper.runPa11yCheck();
    }
  },

  async checkCICCaseNumber() {
    const cicCaseData = await I.grabTextFrom('.govuk-panel__body');
    const caseNumber = await cicCaseData.replace(/\D/g, '');
    if (caseNumber.length !== 16) {
      throw new Error(`String length should be 16, but it is ${caseNumber.length}`);
    }
  }
};
