/// <reference types='codeceptjs' />
type loginPage = typeof import('./e2e/pages/login.page');
type landingPage = typeof import('./e2e/pages/LandingPage');
type subjectDetailsPage = typeof import('./e2e/pages/SubjectDetails.page');
type subjectContactDetailsPage = typeof import('./e2e/pages/SubjectContactDetails.page');
type representationPage = typeof import('./e2e/pages/Representation.page');
type representationQualifiedPage = typeof import('./e2e/pages/RepresentationQualified.page');
type representativeDetailsPage = typeof import('./e2e/pages/RepresentativeDetails.page');
type uploadAppealForm = typeof import('./e2e/pages/UploadAppealForm.page');
type uploadSupportingDocuments = typeof import('./e2e/pages/UploadSupportingDocuments.page');
type uploadOtherInformation = typeof import('./e2e/pages/UploadOtherInformation.page');
type checkYourAnswersPage = typeof import('./e2e/pages/CheckYourAnswers.page');
type applicationSubmittedPage = typeof import('./e2e/pages/applicationSubmitted.page');


declare namespace CodeceptJS {
    interface SupportObject {
      I: I;
      loginPage: loginPage;
      landingPage: landingPage;
      subjectDetailsPage: subjectDetailsPage;
      subjectContactDetailsPage: subjectContactDetailsPage;
      representationPage: representationPage;
      representationQualifiedPage: representationQualifiedPage;
      representativeDetailsPage: representativeDetailsPage;
      uploadAppealForm: uploadAppealForm;
      uploadSupportingDocuments: uploadSupportingDocuments;
      uploadOtherInformation: uploadOtherInformation;
      checkYourAnswersPage: checkYourAnswersPage;
      applicationSubmittedPage: applicationSubmittedPage;
      current: any;
      retries: (times: number) => void;
      login: (user: string) => void;
    }
    interface Methods extends Playwright {}
    interface I extends WithTranslation<Methods> {}
    namespace Translation {
      interface Actions {}
    }
  }