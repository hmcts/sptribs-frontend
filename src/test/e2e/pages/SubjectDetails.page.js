const { I } = inject();
const subjectDetails = require('../fixtures/content/SubjectDetails_content');

module.exports = {
  fields: {
    fullName: '#subjectFullName',
    dayOfBirth: '#subjectDateOfBirth-day',
    monthOfBirth: '#subjectDateOfBirth-month',
    yearOfBirth: '#subjectDateOfBirth-year',
  },

  continueButton: '#main-form-submit',

 checkPageLoads() {
    I.waitForText(subjectDetails.pageTitle);
    I.waitForText(subjectDetails.hintText1);
    I.waitForText(subjectDetails.subHeading1);
    I.waitForText(subjectDetails.subHeading2);
    I.waitForText(subjectDetails.hintText2);
    I.waitForText(subjectDetails.textOnPage1);
    I.waitForText(subjectDetails.textOnPage2);
    I.waitForText(subjectDetails.textOnPage3);
    },

  fillInfields() {
    I.fillField(this.fields.fullName, subjectDetails.name);
    I.fillField(this.fields.dayOfBirth, subjectDetails.dayOfBirth);
    I.fillField(this.fields.monthOfBirth, subjectDetails.monthOfBirth);
    I.fillField(this.fields.yearOfBirth, subjectDetails.yearOfBirth);
    I.click(this.continueButton);
    I.waitForNavigation();
  },
};
