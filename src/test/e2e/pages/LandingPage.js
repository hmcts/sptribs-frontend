const config = require('../config');
const { I } = inject();
const LandingpageDetails = require('../fixtures/content/LandingPage_content');
const pa11yHelper = require('../helpers/pa11y_helper.js');

module.exports = {

  startButton: 'a[role="button"]',

  async seeTheLandingPage() {
    console.log('User using the URL= ' + config.baseUrl);
    await I.amOnPage(config.baseUrl)
    I.see(LandingpageDetails.pageTitle);
    I.see(LandingpageDetails.subHeading);
    I.see(LandingpageDetails.hintMessage);
    I.see(LandingpageDetails.descriptionL1);
    I.see(LandingpageDetails.descriptionL2);
    pa11yHelper.runPa11yCheck();
  },

  async continueOn() {
    await I.click(this.startButton);
  }
};
