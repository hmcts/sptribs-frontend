const { I } = inject();

const config = require('../config.js');
const pa11yHelper = require('../helpers/pa11y_helper.js');
const applicationSubmittedDetails = require('../fixtures/content/applicationSubmitted_content.js')

module.exports = {

  closeAndExitButton: 'a[role=\'button\']',

  async checkPageLoads(pa11y_helper) {
    await I.waitForText(applicationSubmittedDetails.pagetitle);
    I.see(applicationSubmittedDetails.subtitle1);
    I.see(applicationSubmittedDetails.textonpage1);
    I.see(applicationSubmittedDetails.textonpage2);
    I.see(applicationSubmittedDetails.subtitle2);
    I.see(applicationSubmittedDetails.textonpage3);
    I.see(applicationSubmittedDetails.textonpage4);
    I.see(applicationSubmittedDetails.textonpage5);
    I.see(applicationSubmittedDetails.button);
    if (pa11y_helper === true) {
      pa11yHelper.runPa11yCheck();
    }
  },

};
