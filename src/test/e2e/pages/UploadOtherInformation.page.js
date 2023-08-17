const { I } = inject();
const config = require('../config.js');
const UploadOtherInfo = require('../fixtures/content/UploadOtherInformation_content');
const pa11yHelper = require('../helpers/pa11y_helper.js');

module.exports = {
  fields: {
    dropDown: '.govuk-details__summary-text',
    uploadFileButton: '#file-upload-1',
    fileUploadedOption: 'button[type="upload document"]',
    documentRelevance: '#documentRelevance',
    additionalInfo: '#additionalInformation',
  },

  continueButton: '#main-form-submit',

  async checkPageLoads() {
    await I.waitForText(UploadOtherInfo.pageTitle);
    await I.click(this.fields.dropDown);
    I.see(UploadOtherInfo.subTitle1);
    I.see(UploadOtherInfo.textonpage1);
    I.see(UploadOtherInfo.textonpage2);
    I.see(UploadOtherInfo.textonpage3);
    I.see(UploadOtherInfo.textonpage4);
    I.see(UploadOtherInfo.textonpage5);
    I.see(UploadOtherInfo.textonpage6);
    I.see(UploadOtherInfo.textonpage7);
    I.see(UploadOtherInfo.textonpage8);
    I.see(UploadOtherInfo.textonpage9);
    I.see(UploadOtherInfo.textonpage10);
    I.see(UploadOtherInfo.textonpage11);
    I.see(UploadOtherInfo.textonpage12);
    I.see(UploadOtherInfo.textonpage13);
    I.see(UploadOtherInfo.textonpage14);
    I.see(UploadOtherInfo.textonpage15);
    I.see(UploadOtherInfo.textonpage16);
    I.see(UploadOtherInfo.subTitle2);
    I.see(UploadOtherInfo.textonpage17);
    I.see(UploadOtherInfo.subTitle3);
    I.see(UploadOtherInfo.textonpage18);
    pa11yHelper.runPa11yCheck();
  },

  async triggerErrorMessages() {
    await I.waitForText(UploadOtherInfo.pageTitle);
    await I.attachFile(this.fields.uploadFileButton, config.testOdtFile)
    await I.click(this.fields.fileUploadedOption);
    await I.waitForText(UploadOtherInfo.errorBanner, '.govuk-error-summary__title');
    I.see(UploadOtherInfo.fileTypeError, { xpath: "//a[contains(text(), '" + UploadOtherInfo.fileTypeError + "')]" });
  },


  async uploadDocumentsSection() {
    await I.attachFile(this.fields.uploadFileButton, config.testWordFile);
    await I.click(this.fields.fileUploadedOption)
    await I.waitForElement(UploadOtherInfo.fileUploadedSuccess, 10);
    I.see(UploadOtherInfo.deleteButton);
    await I.fillField(this.fields.documentRelevance, UploadOtherInfo.documentRelevance);
    await I.fillField(this.fields.additionalInfo, UploadOtherInfo.additionalInfo);
    I.click(this.continueButton);
  },
};
