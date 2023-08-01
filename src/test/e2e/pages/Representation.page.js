const { I } = inject();
const representation = require('../fixtures/content/Representation_content');

module.exports = {

  representationYes: '#representation',
  representationNo: '#representation-2',
  continueButton: '#main-form-submit',

 async checkPageLoads() {
    await I.waitForText(representation.pageTitle);
    I.see(representation.textOnPage1);
    I.see(representation.textOnPage2);
    },

   async fillInFields() {
    await I.click(this.representationYes);
    I.click(this.continueButton);
  },
};
