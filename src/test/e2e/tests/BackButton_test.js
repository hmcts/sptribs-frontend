const { I } = inject();

Feature('Back button journey @e2e-tests').retry(2);

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
    await checkYourAnswersPage.checkPageLoads(false);
    await checkYourAnswersPage.pressBackButton();
    await uploadOtherInformation.checkPageLoads(false);
    await uploadOtherInformation.pressBackButton();
    await uploadSupportingDocuments.checkPageLoads(false);
    await uploadSupportingDocuments.pressBackButton();
    await uploadAppealForm.checkPageLoads(false);
    await uploadAppealForm.pressBackButton();
    await representativeDetailsPage.checkPageLoads(false);
    await representativeDetailsPage.pressBackButton();
    await representationQualifiedPage.checkPageLoads(false);
    await representationQualifiedPage.pressBackButton();
    await representationPage.checkPageLoads(false);
    await representationPage.pressBackButton();
    await subjectContactDetailsPage.checkPageLoads(false);
    await subjectContactDetailsPage.pressBackButton();
    await subjectDetailsPage.checkPageLoads(false);
  }
);
