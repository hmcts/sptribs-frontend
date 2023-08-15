const { I } = inject();

Feature('Trigger errors @e2e-tests');

Scenario(
  'Run through the entire application and check all error messaging',
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
  }) => {
    await landingPage.seeTheLandingPage();
    await landingPage.continueOn();
    await loginPage.SignInUser();
    await subjectDetailsPage.triggerErrorMessages();
    await subjectDetailsPage.fillInFields();
    await subjectContactDetailsPage.triggerErrorMessages();
    await subjectContactDetailsPage.fillInFields();
//    await representationPage.checkPageLoads();
//    await representationPage.fillInFields();
//    await representationQualifiedPage.checkPageLoads();
//    await representationQualifiedPage.fillInFields();
//    await representativeDetailsPage.checkPageLoads();
//    await representativeDetailsPage.fillInFields();
//    await uploadAppealForm.checkPageLoads();
//    await uploadAppealForm.uploadDocumentsSection();
//    await uploadSupportingDocuments.checkPageLoads();
//    await uploadSupportingDocuments.uploadDocumentsSection();
//    await uploadOtherInformation.checkPageLoads();
//    await uploadOtherInformation.uploadDocumentsSection();
//    await I.click('button[name="opt-out-button"]'); // opt out of PCQ
//    checkYourAnswersPage.checkPageLoads();
//    checkYourAnswersPage.checkValidInfoAllFields();
  }
);
