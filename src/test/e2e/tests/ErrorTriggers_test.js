const { I } = inject();

Feature('Trigger errors @e2e-tests').retry(1);

//Scenario(
//  'Run through the entire application and check all error messaging',
//  async ({
////    landingPage,
////    loginPage,
////    subjectDetailsPage,
////    subjectContactDetailsPage,
////    representationPage,
////    representationQualifiedPage,
////    representativeDetailsPage,
////    uploadAppealForm,
////    uploadSupportingDocuments,
////    uploadOtherInformation,
////  }) => {
////    await landingPage.seeTheLandingPage();
////    await landingPage.continueOn();
////    await loginPage.SignInUser();
////    await subjectDetailsPage.triggerErrorMessages();
////    await subjectDetailsPage.fillInFields();
//    await subjectContactDetailsPage.triggerErrorMessages();
//    await subjectContactDetailsPage.fillInFields();
//    await representationPage.triggerErrorMessages();
//    await representationPage.fillInFields();
//    await representationQualifiedPage.triggerErrorMessages();
//    await representationQualifiedPage.fillInFields();
//    await representativeDetailsPage.triggerErrorMessages();
//    await representativeDetailsPage.fillInFields();
//    await uploadAppealForm.triggerErrorMessages();
//    await uploadAppealForm.uploadDocumentsSection();
//    await uploadSupportingDocuments.triggerErrorMessages();
//    await uploadSupportingDocuments.uploadDocumentsSection();
//    await uploadOtherInformation.triggerErrorMessages();
//    await uploadOtherInformation.uploadDocumentsSection();
//    await I.click('button[name="opt-out-button"]'); // Just checks that it's got to this page
//  }
//);
