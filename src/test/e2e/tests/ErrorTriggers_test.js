const { I } = inject();

Feature('Trigger errors @e2e-tests').retry(2);

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
    await subjectDetailsPage.checkPageLoads(false);
    await subjectDetailsPage.triggerErrorMessages();
    await subjectDetailsPage.fillInFields();
    await subjectContactDetailsPage.checkPageLoads(false);
    await subjectContactDetailsPage.triggerErrorMessages();
    await subjectContactDetailsPage.fillInFields();
    await representationPage.checkPageLoads(false);
    await representationPage.triggerErrorMessages();
    await representationPage.fillInFields();
    await representationQualifiedPage.checkPageLoads(false);
    await representationQualifiedPage.triggerErrorMessages();
    await representationQualifiedPage.fillInFields();
    await representativeDetailsPage.checkPageLoads(false);
    await representativeDetailsPage.triggerErrorMessages();
    await representativeDetailsPage.fillInFields();
    await uploadAppealForm.checkPageLoads(false);
    await uploadAppealForm.triggerErrorMessages();
    await uploadAppealForm.uploadDocumentsSection();
    await uploadSupportingDocuments.checkPageLoads(false);
    await uploadSupportingDocuments.triggerErrorMessages();
    await uploadSupportingDocuments.uploadDocumentsSection();
    await uploadOtherInformation.checkPageLoads(false);
    await uploadOtherInformation.triggerErrorMessages();
    await uploadOtherInformation.uploadDocumentsSection();
    await I.waitForSelector('button[name="opt-out-button"]'); // Just checks that it's got to this page
  }
);
