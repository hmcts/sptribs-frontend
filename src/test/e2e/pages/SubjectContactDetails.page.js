const { I } = inject();
const subjectDetails = require('../fixtures/content/SubjectContactDetails_content');

module.exports = {
  fields: {
    email: '#subjectEmailAddress',
    mobileNumber: '#subjectContactNumber',
  },

  contactAgreeBox: '#subjectAgreeContact',
  continueButton: '#main-form-submit',

 checkPageLoads() {
    I.waitForText(subjectDetails.pageTitle);
    I.waitForText(subjectDetails.subHeading1);
    I.waitForText(subjectDetails.subHeading2);
    I.waitForText(subjectDetails.textOnPage1);
    I.waitForText(subjectDetails.textOnPage2);
    },

  fillInFields() {
    I.fillField(this.fields.email, subjectDetails.emailAddress);
    I.fillField(this.fields.mobileNumber, subjectDetails.contactNumber);
    I.click(this.contactAgreeBox);
    I.click(this.continueButton);
    I.waitForNavigation();
  },
};
