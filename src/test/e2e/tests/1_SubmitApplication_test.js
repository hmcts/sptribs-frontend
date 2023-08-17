const { I } = inject();

Feature('Create application @e2e-tests').retry(1);

Scenario(
  'Create an application with all details, a representative, additional information, no PCQ, and submit, pa11y test as it goes along.',
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
    await subjectDetailsPage.checkPageLoads();
    await subjectDetailsPage.fillInFields();
    await subjectContactDetailsPage.checkPageLoads();
    await subjectContactDetailsPage.fillInFields();
    await representationPage.checkPageLoads();
    await representationPage.fillInFields();
    await representationQualifiedPage.checkPageLoads();
    await representationQualifiedPage.fillInFields();
    await representativeDetailsPage.checkPageLoads();
    await representativeDetailsPage.fillInFields();
    await uploadAppealForm.checkPageLoads();
    await uploadAppealForm.uploadDocumentsSection();
    await uploadSupportingDocuments.checkPageLoads();
    await uploadSupportingDocuments.uploadDocumentsSection();
    await uploadOtherInformation.checkPageLoads();
    await uploadOtherInformation.uploadDocumentsSection();
    await I.click('button[name="opt-out-button"]'); // opt out of PCQ
    await checkYourAnswersPage.checkPageLoads();
    await checkYourAnswersPage.checkValidInfoAllFields();
  }
);
