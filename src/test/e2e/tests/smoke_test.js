const config = require('../config');
const { I } = inject();

Feature('Smoke tests @smoke-tests').retry(2);

Scenario('Send a get request to check the service is up.', async () => {
  try {
    const response = await fetch(config.baseUrl);
    if (response.status === 200) {
      console.log('Landing page is accessible. Endpoint is running.');
    } else {
      console.error('Landing page is not accessible. Endpoint is not running. Status code:', response.status);
    }
  } catch (error) {
    console.error('Failed to make the GET request:', error.message);
  }
});

Scenario(
  'Create an application with minimal details.',
  async ({
    landingPage,
    loginPage,
    subjectDetailsPage,
    subjectContactDetailsPage,
    representationPage,
    uploadAppealForm,
    uploadSupportingDocuments,
    uploadOtherInformation,
    checkYourAnswersPage,
  }) => {
    const pa11yTests = false;
    const representationPresent = false;
    const uploadOtherInfo = false;
    await landingPage.seeTheLandingPage(pa11yTests);
    await landingPage.continueOn();
    await loginPage.SignInUser();
    await subjectDetailsPage.fillInFields();
    await subjectContactDetailsPage.fillInFields();
    await representationPage.fillInFields(representationPresent);
    await uploadAppealForm.uploadDocumentsSection();
    await uploadSupportingDocuments.uploadDocumentsSection();
    await uploadOtherInformation.uploadDocumentsSection(uploadOtherInfo);
    await I.click('button[name="opt-out-button"]'); // opt out of PCQ
    await checkYourAnswersPage.continueOn();
  }
);
