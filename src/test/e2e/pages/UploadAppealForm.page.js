const { I } = inject();
const config = require('../config.js');
const UploadAppealForm = require('../fixtures/content/UploadAppealForm_content');

module.exports = {
  fields: {
    dropDown: '.govuk-details__summary-text',
    uploadFileButton: '#file-upload-1',
    fileUploadedOption: 'button[type="upload document"]',
  },

  continueButton: '#main-form-submit',

async checkPageLoads() {
    await I.waitForText(UploadAppealForm.pageTitle);
    await I.click(this.fields.dropDown);
    I.see(UploadAppealForm.textonpage1);
    I.see(UploadAppealForm.textonpage2);
    I.see(UploadAppealForm.textonpage3);
    I.see(UploadAppealForm.textonpage4);
    I.see(UploadAppealForm.textonpage5);
    I.see(UploadAppealForm.textonpage6);
    I.see(UploadAppealForm.textonpage7);
    I.see(UploadAppealForm.textonpage8);
    },

async uploadDocumentsSection() {
    await I.attachFile(this.fields.uploadFileButton, config.testPdfFile);
    await I.click(this.fields.fileUploadedOption)
    await I.waitForElement(UploadAppealForm.fileUploadedSuccess, 10);
    I.see(UploadAppealForm.deleteButton);
    I.click(this.continueButton);
  },
};
