const { I } = inject();
const representationQualified = require('../fixtures/content/RepresentationQualified_content');

module.exports = {

  qualifiedYes: '#representationQualified',
  qualifiedNo: '#representationQualified-2',
  continueButton: '#main-form-submit',

 async checkPageLoads() {
    await I.waitForText(representationQualified.pageTitle);
    I.see(representationQualified.hintMessage);
    I.see(representationQualified.textOnPage1);
    I.see(representationQualified.textOnPage2);
    },

  async fillInFields() {
    await I.click(this.qualifiedYes);
    I.click(this.continueButton);
  },
};