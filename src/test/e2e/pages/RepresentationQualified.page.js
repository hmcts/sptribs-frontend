const { I } = inject();
const representationQualified = require('../fixtures/content/RepresentationQualified_content');
const pa11yHelper = require('../helpers/pa11y_helper.js');

module.exports = {

  qualifiedYes: '#representationQualified',
  qualifiedNo: '#representationQualified-2',
  continueButton: '#main-form-submit',

  async checkPageLoads(pa11y_helper) {
    await I.waitForText(representationQualified.pageTitle);
    I.see(representationQualified.hintMessage);
    I.see(representationQualified.textOnPage1);
    I.see(representationQualified.textOnPage2);
    if (pa11y_helper === true) {
      pa11yHelper.runPa11yCheck();
    }
  },

  async triggerErrorMessages() {
    await I.waitForText(representationQualified.pageTitle);
    await I.click(this.continueButton);
    await I.waitForText(representationQualified.errorBanner, '.govuk-error-summary__title');
    I.see(representationQualified.selectionError, { xpath: "//a[contains(text(), '" + representationQualified.selectionError + "')]" });
    I.see(representationQualified.selectionError, { xpath: "//p[@id='representationQualified-error' and contains(., '" + representationQualified.selectionError + "')]" });
  },

  async fillInFields() {
    await I.click(this.qualifiedYes);
    I.click(this.continueButton);
  },
};
