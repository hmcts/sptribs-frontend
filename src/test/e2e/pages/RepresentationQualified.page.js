const { I } = inject();
const representationQualified = require('../fixtures/content/RepresentationQualified_content');

module.exports = {

  qualifiedYes: '#representationQualified',
  qualifiedNo: '#representationQualified-2',
  continueButton: '#main-form-submit',

 async checkPageLoads() {
    await I.waitForText(representation.pageTitle);
    I.see(representationQualified.hintMessage);
    I.see(representationQualified.textOnPage1);
    I.see(representationQualified.textOnPage2);
    },

  fillInFields() {
    I.click(this.qualifiedYes);
    I.click(this.continueButton);
    I.waitForNavigation();
  },
};
