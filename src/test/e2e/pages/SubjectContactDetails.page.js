const { I } = inject();
const subjectDetails = require('../fixtures/content/SubjectContactDetails_content');
const pa11yHelper = require('../helpers/pa11y_helper.js');

module.exports = {
  fields: {
    email: '#subjectEmailAddress',
    mobileNumber: '#subjectContactNumber',
  },

  contactAgreeBox: '#subjectAgreeContact',
  continueButton: '#main-form-submit',

  async checkPageLoads(pa11y_helper) {
    await I.waitForText(subjectDetails.pageTitle, 30);
    I.see(subjectDetails.subHeading1);
    I.see(subjectDetails.subHeading2);
    I.see(subjectDetails.textOnPage1);
    I.see(subjectDetails.textOnPage2);
    if (pa11y_helper === true) {
      pa11yHelper.runPa11yCheck();
    }
  },

  async triggerErrorMessages() {
    await I.waitForText(subjectDetails.pageTitle);
    await I.click(this.continueButton);
    await I.waitForText(subjectDetails.errorBanner, '.govuk-error-summary__title');
    I.see(subjectDetails.validEmailError, { xpath: "//a[contains(text(), '" + subjectDetails.validEmailError + "')]" });
    I.see(subjectDetails.validEmailError, { xpath: "//p[@id='subjectEmailAddress-error' and contains(., '" + subjectDetails.validEmailError + "')]" });
    I.see(subjectDetails.validContactNumberError, { xpath: "//a[contains(text(), '" + subjectDetails.validContactNumberError + "')]" });
    I.see(subjectDetails.validContactNumberError, { xpath: "//p[@id='subjectContactNumber-error' and contains(., '" + subjectDetails.validContactNumberError + "')]" });
    I.see(subjectDetails.agreeError, { xpath: "//a[contains(text(), '" + subjectDetails.agreeError + "')]" });
    I.fillField(this.fields.email, subjectDetails.partEmailEntry);
    await I.click(this.continueButton);
    await I.waitForText(subjectDetails.partEmailError, { xpath: "//a[contains(text(), '" + subjectDetails.partEmailError + "')]" });
    I.see(subjectDetails.partEmailError, { xpath: "//p[@id='subjectEmailAddress-error' and contains(., '" + subjectDetails.partEmailError + "')]" });
    I.clearField(this.fields.email)
  },

  async fillInFields() {
    I.fillField(this.fields.email, subjectDetails.emailAddress);
    I.fillField(this.fields.mobileNumber, subjectDetails.contactNumber);
    I.click(this.contactAgreeBox);
    await I.click(this.continueButton);
  },
};
