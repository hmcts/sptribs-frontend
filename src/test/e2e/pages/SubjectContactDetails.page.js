const { I } = inject();
const subjectDetails = require('../fixtures/content/SubjectContactDetails_content');

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
    },

  async fillInFields() {
    I.fillField(this.fields.email, subjectDetails.emailAddress);
    I.fillField(this.fields.mobileNumber, subjectDetails.contactNumber);
    I.click(this.contactAgreeBox);
    await I.click(this.continueButton);
  },
};
