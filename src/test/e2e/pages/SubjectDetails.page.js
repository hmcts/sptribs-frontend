const { I } = inject();
const subjectDetails = require('../fixtures/content/SubjectDetails_content');
const pa11yHelper = require('../helpers/pa11y_helper.js');

module.exports = {
  fields: {
    fullName: '#subjectFullName',
    dayOfBirth: '#subjectDateOfBirth-day',
    monthOfBirth: '#subjectDateOfBirth-month',
    yearOfBirth: '#subjectDateOfBirth-year',
  },

  continueButton: '#main-form-submit',

 async checkPageLoads() {
    await I.waitForText(subjectDetails.pageTitle);
    I.see(subjectDetails.hintText1);
    I.see(subjectDetails.subHeading1);
    I.see(subjectDetails.subHeading2);
    I.see(subjectDetails.hintText2);
    I.see(subjectDetails.textOnPage1);
    I.see(subjectDetails.textOnPage2);
    I.see(subjectDetails.textOnPage3);
    pa11yHelper.runPa11yCheck();
    },

  async fillInFields() {
    I.fillField(this.fields.fullName, subjectDetails.name);
    I.fillField(this.fields.dayOfBirth, subjectDetails.dayOfBirth);
    I.fillField(this.fields.monthOfBirth, subjectDetails.monthOfBirth);
    I.fillField(this.fields.yearOfBirth, subjectDetails.yearOfBirth);
    await I.click(this.continueButton);
  },
};
