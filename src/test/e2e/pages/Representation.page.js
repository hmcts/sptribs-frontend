const { I } = inject();
const representation = require('../fixtures/content/Representation_content');
const pa11yHelper = require('../helpers/pa11y_helper.js');

module.exports = {
  representationYes: '#representation',
  representationNo: '#representation-2',
  continueButton: '#main-form-submit',
  backButton: '.govuk-back-link',

  async checkPageLoads(pa11y_helper) {
    await I.see(representation.pageTitle);
    I.see(representation.textOnPage1);
    I.see(representation.textOnPage2);
    if (pa11y_helper === true) {
      pa11yHelper.runPa11yCheck();
    }
  },

  async triggerErrorMessages() {
    await I.see(representation.pageTitle);
    await I.click(this.continueButton);
    await I.see(representation.errorBanner, '.govuk-error-summary__title');
    I.see(representation.selectionError, { xpath: "//a[contains(text(), '" + representation.selectionError + "')]" });
    I.see(representation.selectionError, { xpath: "//p[@id='representation-error' and contains(., '" + representation.selectionError + "')]" });
  },

  async fillInFields(representationPresent) {
    if (representationPresent) {
      await I.click(this.representationYes);
    } else {
      await I.click(this.representationNo);
    }
    await I.click(this.continueButton);
  },

  async pressBackButton() {
    await I.see(representation.pageTitle);
    I.click(this.backButton);
  },
};
