const { I } = inject();

Feature('Back button journey @e2e-tests').retry(1);

Scenario(
  'Create an application with all details and test all back buttons.',
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
    await uploadOtherInformation.uploadDocumentsSection();
    await I.click('button[name="opt-out-button"]'); // opt out of PCQ
    await checkYourAnswersPage.checkPageLoads();
    await checkYourAnswersPage.pressBackButton();
    await uploadOtherInformation.pressBackButton();
    await uploadSupportingDocuments.pressBackButton();
    await uploadAppealForm.pressBackButton();
    await representativeDetailsPage.pressBackButton();
    await representationQualifiedPage.pressBackButton();
    await representationPage.pressBackButton();
    await subjectContactDetailsPage.pressBackButton();
    await subjectDetailsPage.checkPageLoads();
  }
);
