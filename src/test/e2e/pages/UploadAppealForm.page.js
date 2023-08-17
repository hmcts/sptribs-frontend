const { I } = inject();
const config = require('../config.js');
const UploadAppealForm = require('../fixtures/content/UploadAppealForm_content');
const pa11yHelper = require('../helpers/pa11y_helper.js');

module.exports = {
  fields: {
    dropDown: '.govuk-details__summary-text',
    uploadFileButton: '#file-upload-1',
    fileUploadedOption: 'button[type="upload document"]',
  },

  continueButton: '#main-form-submit',
  backButton: '.govuk-back-link',

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
    pa11yHelper.runPa11yCheck();
  },

  async triggerErrorMessages() {
    await I.waitForText(UploadAppealForm.pageTitle);
    await I.click(this.continueButton);
    await I.waitForText(UploadAppealForm.errorBanner, '.govuk-error-summary__title');
    I.see(UploadAppealForm.noUploadError, { xpath: "//a[contains(text(), '" + UploadAppealForm.noUploadError + "')]" });
    await I.refreshPage();
    await I.attachFile(this.fields.uploadFileButton, config.testFile)
    await I.click(this.fields.fileUploadedOption);
    await I.waitForText(UploadAppealForm.errorBanner, '.govuk-error-summary__title');
    I.see(UploadAppealForm.fileTypeError, { xpath: "//a[contains(text(), '" + UploadAppealForm.fileTypeError + "')]" });
  },

  async uploadDocumentsSection() {
    await I.attachFile(this.fields.uploadFileButton, config.testPdfFile);
    await I.click(this.fields.fileUploadedOption)
    await I.waitForElement(UploadAppealForm.fileUploadedSuccess, 10);
    I.see(UploadAppealForm.deleteButton);
    I.click(this.continueButton);
  },

  async pressBackButton() {
    await I.waitForText(UploadAppealForm.pageTitle);
    I.click(this.backButton);
  },
};
