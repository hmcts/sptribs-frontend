const config = require('../config');
const { I } = inject();

module.exports = {
  fields: {
    username: '#username',
    password: '#password',
  },
  submitButton: 'input[value="Sign in"]',

  async SignInUser() {
    await I.fillField(this.fields.username, "st-citizen1@mailinator.com");
    await I.fillField(this.fields.password, "Password123");
    await I.click(this.submitButton);
  },
};
