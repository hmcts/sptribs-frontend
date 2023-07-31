const config = require('../config');
const { I } = inject();
const LandingpageDetails = require('../fixtures/content/LandingPage_content');


module.exports = {

  startButton: 'a[role="button"]',

  async seeTheLandingPage() {
    console.log('User using the URL= ' + config.baseUrl);
    await I.amOnPage(config.baseUrl)
    await I.see(LandingpageDetails.pageTitle);
    await I.see(LandingpageDetails.subHeading);
    await I.see(LandingpageDetails.hintMessage);
    await I.see(LandingpageDetails.descriptionL1);
    await I.see(LandingpageDetails.descriptionL2);
    await I.click(this.startButton);
  },
};
