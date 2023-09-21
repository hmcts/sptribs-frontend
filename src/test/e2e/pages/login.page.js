const config = require('../config');
const { I } = inject();

module.exports = {
  fields: {
    username: '#username',
    password: '#password',
  },
  submitButton: 'input[value="Sign in"]',

  async SignInUser() {
    await I.waitForText('Sign in or create an account');
    await I.fillField(this.fields.username, config.citizenUserOne.email);
    await I.fillField(this.fields.password, config.citizenUserOne.password);
    await I.click(this.submitButton);
  },
};
