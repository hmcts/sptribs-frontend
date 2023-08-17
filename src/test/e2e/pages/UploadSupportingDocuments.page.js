const { I } = inject();
const config = require('../config.js');
const UploadSupportingDocuments = require('../fixtures/content/UploadSupportingDocuments_content');
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
    await I.waitForText(UploadSupportingDocuments.pageTitle);
    await I.click(this.fields.dropDown);
    I.see(UploadSupportingDocuments.textonpage1);
    I.see(UploadSupportingDocuments.textonpage2);
    I.see(UploadSupportingDocuments.textonpage3);
    I.see(UploadSupportingDocuments.textonpage4);
    I.see(UploadSupportingDocuments.textonpage5);
    I.see(UploadSupportingDocuments.textonpage6);
    I.see(UploadSupportingDocuments.textonpage7);
  },

  async triggerErrorMessages() {
    await I.waitForText(UploadSupportingDocuments.pageTitle);
    await I.click(this.continueButton);
    await I.waitForText(UploadSupportingDocuments.errorBanner, '.govuk-error-summary__title');
    I.see(UploadSupportingDocuments.noUploadError, { xpath: "//a[contains(text(), '" + UploadSupportingDocuments.noUploadError + "')]" });
    await I.refreshPage();
    await I.attachFile(this.fields.uploadFileButton, config.testOdtFile)
    await I.click(this.fields.fileUploadedOption);
    await I.waitForText(UploadSupportingDocuments.errorBanner, '.govuk-error-summary__title');
    I.see(UploadSupportingDocuments.fileTypeError, { xpath: "//a[contains(text(), '" + UploadSupportingDocuments.fileTypeError + "')]" });
  },

  async uploadDocumentsSection() {
    await I.attachFile(this.fields.uploadFileButton, config.testFile);
    await I.click(this.fields.fileUploadedOption)
    await I.waitForElement(UploadSupportingDocuments.fileUploadedSuccess, 10);
    I.see(UploadSupportingDocuments.deleteButton);
    I.click(this.continueButton);
    pa11yHelper.runPa11yCheck();
  },

  async pressBackButton() {
    await I.waitForText(UploadSupportingDocuments.pageTitle);
    I.click(this.backButton);
  },
};
