const config = require('../config');
const { I } = inject();

module.exports = {
  fields: {
    username: '#username',
    password: '#password',
  },
  submitButton: 'input[value="Sign in"]',

    async SignInUser() {
    await I.see('Sign in or create an account');
    await I.waitForElement(this.fields.username);
    await I.fillField(this.fields.username, 'st-citizen1@mailinator.com');
    await I.waitForElement(this.fields.password);
    await I.fillField(this.fields.password, config.citizenUserOne.password);
    await I.click(this.submitButton);
    },
};
