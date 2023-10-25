const config = require('../config');
const { I } = inject();

Feature('Smoke tests @smoke-tests @cross-browser').retry(1);

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
    representationQualifiedPage,
    representativeDetailsPage,
    uploadAppealForm,
    uploadSupportingDocuments,
    uploadOtherInformation,
    checkYourAnswersPage,
  }) => {
    await landingPage.seeTheLandingPage();
    await landingPage.continueOn();
    await loginPage.SignInUser();
    await subjectDetailsPage.fillInFields();
    await subjectContactDetailsPage.fillInFields();
    await representationPage.fillInFields();
    await representationQualifiedPage.fillInFields();
    await representativeDetailsPage.fillInFields();
    await uploadAppealForm.uploadDocumentsSection();
    await uploadSupportingDocuments.uploadDocumentsSection();
    await uploadOtherInformation.skipDocumentsSection(); // optional uploads
    await I.click('button[name="opt-out-button"]'); // opt out of PCQ
    await checkYourAnswersPage.continueSmoke();
  }
);
