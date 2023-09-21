const { I } = inject();

//Feature('Create application @e2e-tests').retry(1);
//
//Scenario(
//  'Create an application with all details, a representative, additional information, no PCQ, and submit, pa11y test as it goes along.',
//  async ({
//    landingPage,
//    loginPage,
//    subjectDetailsPage,
//    subjectContactDetailsPage,
//    representationPage,
//    representationQualifiedPage,
//    representativeDetailsPage,
//    uploadAppealForm,
//    uploadSupportingDocuments,
//    uploadOtherInformation,
//    checkYourAnswersPage,
//  }) => {
//    await landingPage.seeTheLandingPage();
//    await landingPage.continueOn();
//    await loginPage.SignInUser();
//    await subjectDetailsPage.checkPageLoads(true);
//    await subjectDetailsPage.fillInFields();
//    await subjectContactDetailsPage.checkPageLoads(true);
//    await subjectContactDetailsPage.fillInFields();
//    await representationPage.checkPageLoads(true);
//    await representationPage.fillInFields();
//    await representationQualifiedPage.checkPageLoads(true);
//    await representationQualifiedPage.fillInFields();
//    await representativeDetailsPage.checkPageLoads(true);
//    await representativeDetailsPage.fillInFields();
//    await uploadAppealForm.checkPageLoads(true);
//    await uploadAppealForm.uploadDocumentsSection();
//    await uploadSupportingDocuments.checkPageLoads(true);
//    await uploadSupportingDocuments.uploadDocumentsSection();
//    await uploadOtherInformation.checkPageLoads(true);
//    await uploadOtherInformation.uploadDocumentsSection();
//    await I.click('button[name="opt-out-button"]'); // opt out of PCQ
//    checkYourAnswersPage.checkPageLoads(true);
//    checkYourAnswersPage.checkValidInfoAllFields();
//  }
//);
