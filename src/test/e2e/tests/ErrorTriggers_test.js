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
    const pa11yTests = false;
    const representationPresent = true;
    const uploadOtherInfo = true;
    await landingPage.seeTheLandingPage();
    await landingPage.continueOn();
    await loginPage.SignInUser();
    await subjectDetailsPage.checkPageLoads(pa11yTests);
    await subjectDetailsPage.triggerErrorMessages();
    await subjectDetailsPage.fillInFields();
    await subjectContactDetailsPage.checkPageLoads(pa11yTests);
    await subjectContactDetailsPage.triggerErrorMessages();
    await subjectContactDetailsPage.fillInFields();
    await representationPage.checkPageLoads(pa11yTests);
    await representationPage.triggerErrorMessages();
    await representationPage.fillInFields(representationPresent);
    await representationQualifiedPage.checkPageLoads(pa11yTests);
    await representationQualifiedPage.triggerErrorMessages();
    await representationQualifiedPage.fillInFields();
    await representativeDetailsPage.checkPageLoads(pa11yTests);
    await representativeDetailsPage.triggerErrorMessages();
    await representativeDetailsPage.fillInFields();
    await uploadAppealForm.checkPageLoads(pa11yTests);
    await uploadAppealForm.triggerErrorMessages();
    await uploadAppealForm.uploadDocumentsSection();
    await uploadSupportingDocuments.checkPageLoads(pa11yTests);
    await uploadSupportingDocuments.triggerErrorMessages();
    await uploadSupportingDocuments.uploadDocumentsSection();
    await uploadOtherInformation.checkPageLoads(pa11yTests);
    await uploadOtherInformation.triggerErrorMessages();
    await uploadOtherInformation.uploadDocumentsSection();
    await I.waitForSelector('button[name="opt-out-button"]'); // Just checks that it's got to this page
  }
);
