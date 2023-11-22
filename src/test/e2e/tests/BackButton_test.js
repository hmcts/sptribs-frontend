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
    let representationPresent = true;
    let pa11yTests = false;
    await landingPage.seeTheLandingPage();
    await landingPage.continueOn();
    await loginPage.SignInUser();
    await subjectDetailsPage.fillInFields();
    await subjectContactDetailsPage.fillInFields();
    await representationPage.fillInFields(representationPresent);
    await representationQualifiedPage.fillInFields();
    await representativeDetailsPage.fillInFields();
    await uploadAppealForm.uploadDocumentsSection();
    await uploadSupportingDocuments.uploadDocumentsSection();
    await uploadOtherInformation.uploadDocumentsSection();
    await I.waitForSelector('button[name="opt-out-button"]');
    await I.click('button[name="opt-out-button"]'); // opt out of PCQ
    await checkYourAnswersPage.checkPageLoads(pa11yTests);
    await checkYourAnswersPage.pressBackButton();
    await uploadOtherInformation.checkPageLoads(pa11yTests);
    await uploadOtherInformation.pressBackButton();
    await uploadSupportingDocuments.checkPageLoads(pa11yTests);
    await uploadSupportingDocuments.pressBackButton();
    await uploadAppealForm.checkPageLoads(pa11yTests);
    await uploadAppealForm.pressBackButton();
    await representativeDetailsPage.checkPageLoads(pa11yTests);
    await representativeDetailsPage.pressBackButton();
    await representationQualifiedPage.checkPageLoads(pa11yTests);
    await representationQualifiedPage.pressBackButton();
    await representationPage.checkPageLoads(pa11yTests);
    await representationPage.pressBackButton();
    await subjectContactDetailsPage.checkPageLoads(pa11yTests);
    await subjectContactDetailsPage.pressBackButton();
    await subjectDetailsPage.checkPageLoads(pa11yTests);
  }
);
