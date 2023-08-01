const { I } = inject();

const config = require('../config.js');
const CheckYourAnswers = require('../fixtures/content/CheckYourAnswers_content');
const subjectDetails = require('../fixtures/content/SubjectDetails_content');
const subjectContactDetails = require('../fixtures/content/SubjectContactDetails_content');
const representativeDetails = require('../fixtures/content/RepresentativeDetails_content');
const UploadOtherInfo = require('../fixtures/content/UploadOtherInformation_content');

function convertDate() {
    const dayOfBirth = subjectDetails.dayOfBirth;
    const monthOfBirth = subjectDetails.monthOfBirth;
    const yearOfBirth = subjectDetails.yearOfBirth;
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = months[Number(monthOfBirth) - 1];
    const formattedDate = `${dayOfBirth} ${monthName} ${yearOfBirth}`;
    return formattedDate;
}

module.exports = {

  continueButton: '#main-form-submit',

  async checkPageLoads() {
    await I.waitForText(CheckYourAnswers.pagetitle);
    I.see(CheckYourAnswers.subtitle1);
    I.see(CheckYourAnswers.textonpage1);
    I.see(CheckYourAnswers.textonpage2);
    I.see(CheckYourAnswers.textonpage3);
    I.see(CheckYourAnswers.textonpage4);
    I.see(CheckYourAnswers.subtitle2);
    I.see(CheckYourAnswers.textonpage5);
    I.see(CheckYourAnswers.textonpage6);
    I.see(CheckYourAnswers.subtitle3);
    I.see(CheckYourAnswers.textonpage7);
    I.see(CheckYourAnswers.textonpage8);
    I.see(CheckYourAnswers.textonpage9);
    I.see(CheckYourAnswers.textonpage10);
    I.see(CheckYourAnswers.subtitle4);
    I.see(CheckYourAnswers.textonpage11);
    I.see(CheckYourAnswers.subtitle5);
    I.see(CheckYourAnswers.textonpage12);
    I.see(CheckYourAnswers.subtitle6);
    I.see(CheckYourAnswers.textonpage13);
    I.see(CheckYourAnswers.textonpage14);
    I.see(CheckYourAnswers.textonpage15);
    I.see(CheckYourAnswers.subtitle7);
    I.see(CheckYourAnswers.textonpage16);
  },

  async checkValidInfoAllFields() {
    const pdfFileName = config.testPdfFile.split('/').pop();
    const wordFileName = config.testWordFile.split('/').pop();
    const txtFileName = config.testFile.split('/').pop();
    const yesElements = locate('//*[contains(text(), "Yes")]');

    I.see(subjectDetails.name);
    I.see(convertDate());
    I.see(subjectContactDetails.emailAddress);
    I.see(subjectContactDetails.contactNumber);
    I.seeNumberOfElements(yesElements, 2);
    I.see(representativeDetails.fullName);
    I.see(representativeDetails.Organisation);
    I.see(representativeDetails.contactNumber);
    I.see(representativeDetails.emailAddress);
    I.see(pdfFileName);
    I.see(wordFileName);
    I.see(txtFileName);
    I.see(UploadOtherInfo.documentRelevance);
    I.see(UploadOtherInfo.additionalInfo);
    await I.click(this.continueButton);
  },

};
