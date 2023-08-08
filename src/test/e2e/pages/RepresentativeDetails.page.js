const { I } = inject();
const representativeDetails = require('../fixtures/content/RepresentativeDetails_content');
const pa11yHelper = require('../helpers/pa11y_helper.js');

module.exports = {
  fields: {
    fullName: '#representativeFullName',
    representativeOrgName: '#representativeOrganisationName',
    representativeContactNumber: '#representativeContactNumber',
    representativeEmailAddress: '#representativeEmailAddress',
  },

  continueButton: '#main-form-submit',

 async checkPageLoads() {
    await I.waitForText(representativeDetails.pageTitle);
    I.see(representativeDetails.textOnPage1);
    I.see(representativeDetails.textOnPage2);
    I.see(representativeDetails.subHeading1);
    I.see(representativeDetails.subHeading2);
    I.see(representativeDetails.subHeading3);
    I.see(representativeDetails.subHeading4);
    pa11yHelper.runPa11yCheck();
    },

  async fillInFields() {
    I.fillField(this.fields.fullName, representativeDetails.fullName);
    I.fillField(this.fields.representativeOrgName, representativeDetails.Organisation);
    I.fillField(this.fields.representativeContactNumber, representativeDetails.contactNumber);
    I.fillField(this.fields.representativeEmailAddress, representativeDetails.emailAddress);
    await I.click(this.continueButton);
  },
};
