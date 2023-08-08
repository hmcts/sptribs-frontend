const { I } = inject();
const representation = require('../fixtures/content/Representation_content');
const pa11yHelper = require('../helpers/pa11y_helper.js');

module.exports = {

  representationYes: '#representation',
  representationNo: '#representation-2',
  continueButton: '#main-form-submit',

 async checkPageLoads() {
    await I.waitForText(representation.pageTitle);
    I.see(representation.textOnPage1);
    I.see(representation.textOnPage2);
    pa11yHelper.runPa11yCheck();
    },

   async fillInFields() {
    await I.click(this.representationYes);
    I.click(this.continueButton);
  },
};
