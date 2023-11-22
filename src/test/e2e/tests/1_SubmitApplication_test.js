const { I } = inject();

Feature('Create application @e2e-tests').retry(2);

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
    applicationSubmittedPage,
  }) => {
    let representationPresent = true;
    let pa11yTests = true;
    await landingPage.seeTheLandingPage();
    await landingPage.continueOn();
    await loginPage.SignInUser();
    await subjectDetailsPage.checkPageLoads(pa11yTests);
    await subjectDetailsPage.fillInFields();
    await subjectContactDetailsPage.checkPageLoads(pa11yTests);
    await subjectContactDetailsPage.fillInFields();
    await representationPage.checkPageLoads(pa11yTests);
    await representationPage.fillInFields(representationPresent);
    await representationQualifiedPage.checkPageLoads(pa11yTests);
    await representationQualifiedPage.fillInFields();
    await representativeDetailsPage.checkPageLoads(pa11yTests);
    await representativeDetailsPage.fillInFields();
    await uploadAppealForm.checkPageLoads(pa11yTests);
    await uploadAppealForm.uploadDocumentsSection();
    await uploadSupportingDocuments.checkPageLoads(pa11yTests);
    await uploadSupportingDocuments.uploadDocumentsSection();
    await uploadOtherInformation.checkPageLoads(pa11yTests);
    await uploadOtherInformation.uploadDocumentsSection();
    await I.waitForSelector('button[name="opt-out-button"]');
    await I.click('button[name="opt-out-button"]'); // opt out of PCQ
    await checkYourAnswersPage.checkPageLoads(pa11yTests, representationPresent);
    await checkYourAnswersPage.checkValidInfoAllFields(representationPresent);
    await checkYourAnswersPage.continueOn()
    await applicationSubmittedPage.checkPageLoads(pa11yTests);
    await applicationSubmittedPage.checkCICCaseNumber();
  }
);

Scenario(
  'Create an application with no representative, additional information, no PCQ, and submit.',
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
    applicationSubmittedPage,
  }) => {
    let representationPresent = false;
    let pa11yTests = false;
    await landingPage.seeTheLandingPage();
    await landingPage.continueOn();
    await loginPage.SignInUser();
    await subjectDetailsPage.checkPageLoads(pa11yTests);
    await subjectDetailsPage.fillInFields();
    await subjectContactDetailsPage.checkPageLoads(pa11yTests);
    await subjectContactDetailsPage.fillInFields();
    await representationPage.checkPageLoads(pa11yTests);
    await representationPage.fillInFields(representationPresent);
    await uploadAppealForm.checkPageLoads(pa11yTests);
    await uploadAppealForm.uploadDocumentsSection();
    await uploadSupportingDocuments.checkPageLoads(pa11yTests);
    await uploadSupportingDocuments.uploadDocumentsSection();
    await uploadOtherInformation.checkPageLoads(pa11yTests);
    await uploadOtherInformation.uploadDocumentsSection();
    await I.waitForSelector('button[name="opt-out-button"]');
    await I.click('button[name="opt-out-button"]'); // opt out of PCQ
    await checkYourAnswersPage.checkPageLoads(pa11yTests, representationPresent);
    await checkYourAnswersPage.checkValidInfoAllFields(representationPresent);
    await checkYourAnswersPage.continueOn()
    await applicationSubmittedPage.checkPageLoads(pa11yTests);
    await applicationSubmittedPage.checkCICCaseNumber();
  }
);
