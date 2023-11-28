const { I } = inject();
const representativeDetails = require('../fixtures/content/RepresentativeDetails_content');
const pa11yHelper = require('../helpers/pa11y_helper.js');

module.exports = {
  fields: {
    fullName: '#representativeFullName',
    representativeOrgName: '#representativeOrganisationName',
    representativeContactNumber: '#representativeContactNumber',
    representativeEmailAddress: '#representativeEmailAddress',
  },

  continueButton: '#main-form-submit',
  backButton: '.govuk-back-link',

  async checkPageLoads(pa11y_helper) {
    await I.see(representativeDetails.pageTitle);
    I.see(representativeDetails.textOnPage1);
    I.see(representativeDetails.textOnPage2);
    I.see(representativeDetails.subHeading1);
    I.see(representativeDetails.subHeading2);
    I.see(representativeDetails.subHeading3);
    I.see(representativeDetails.subHeading4);
    if (pa11y_helper) {
      pa11yHelper.runPa11yCheck();
    }
  },

  async triggerErrorMessages() {
    await I.see(representativeDetails.pageTitle);
    await I.click(this.continueButton);
    await I.see(representativeDetails.errorBanner, '.govuk-error-summary__title');
    I.see(representativeDetails.fullNameError, { xpath: "//a[contains(text(), '" + representativeDetails.fullNameError + "')]" });
    I.see(representativeDetails.fullNameError, { xpath: "//p[@id='representativeFullName-error' and contains(., '" + representativeDetails.fullNameError + "')]" });
    I.see(representativeDetails.organisationNameError, { xpath: "//a[contains(text(), '" + representativeDetails.organisationNameError + "')]" });
    I.see(representativeDetails.organisationNameError, { xpath: "//p[@id='representativeOrganisationName-error' and contains(., '" + representativeDetails.organisationNameError + "')]" });
    I.see(representativeDetails.validContactNumberError, { xpath: "//a[contains(text(), '" + representativeDetails.validContactNumberError + "')]" });
    I.see(representativeDetails.validContactNumberError, { xpath: "//p[@id='representativeContactNumber-error' and contains(., '" + representativeDetails.validContactNumberError + "')]" });
    I.see(representativeDetails.validEmailError, { xpath: "//a[contains(text(), '" + representativeDetails.validEmailError + "')]" });
    I.see(representativeDetails.validEmailError, { xpath: "//p[@id='representativeEmailAddress-error' and contains(., '" + representativeDetails.validEmailError + "')]" });
    I.fillField(this.fields.representativeEmailAddress, representativeDetails.partEmailEntry);
    await I.click(this.continueButton);
    await I.see(representativeDetails.partEmailError, { xpath: "//a[contains(text(), '" + representativeDetails.partEmailError + "')]" });
    I.see(representativeDetails.partEmailError, { xpath: "//p[@id='representativeEmailAddress-error' and contains(., '" + representativeDetails.partEmailError + "')]" });
    I.clearField(this.fields.representativeEmailAddress)
  },

  async fillInFields() {
    I.fillField(this.fields.fullName, representativeDetails.fullName);
    I.fillField(this.fields.representativeOrgName, representativeDetails.Organisation);
    I.fillField(this.fields.representativeContactNumber, representativeDetails.contactNumber);
    I.fillField(this.fields.representativeEmailAddress, representativeDetails.emailAddress);
    await I.click(this.continueButton);
  },

  async pressBackButton() {
    await I.see(representativeDetails.pageTitle);
    I.click(this.backButton);
  },
};
