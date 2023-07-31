const { I } = inject();
const representation = require('../fixtures/content/Representation_content');

module.exports = {

  representationYes: '#representation',
  representationNo: '#representation-2',
  continueButton: '#main-form-submit',

 checkPageLoads() {
    I.waitForText(representation.pageTitle);
    I.waitForText(representation.textOnPage1);
    I.waitForText(representation.textOnPage2);
    },

  fillInFields() {
    I.click(this.representationYes);
    I.click(this.continueButton);
    I.waitForNavigation();
  },
};
