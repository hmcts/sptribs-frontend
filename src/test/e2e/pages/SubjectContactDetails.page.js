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

 async checkPageLoads() {
    await I.waitForText(subjectDetails.pageTitle, 30);
    I.see(subjectDetails.subHeading1);
    I.see(subjectDetails.subHeading2);
    I.see(subjectDetails.textOnPage1);
    I.see(subjectDetails.textOnPage2);
    pa11yHelper.runPa11yCheck();
    },

  async fillInFields() {
    I.fillField(this.fields.email, subjectDetails.emailAddress);
    I.fillField(this.fields.mobileNumber, subjectDetails.contactNumber);
    I.click(this.contactAgreeBox);
    await I.click(this.continueButton);
  },
};
