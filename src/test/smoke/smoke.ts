import axios from 'axios';
import config from 'config';
// import * as landingPage from '../e2e/pages/LandingPage';
// import * as loginPage from '../e2e/pages/login.page';
// import * as subjectDetailsPage from '../e2e/pages/SubjectDetails.page';
// import * as subjectContactDetailsPage from '../e2e/pages/SubjectContactDetails.page';
// import * as representationPage from '../e2e/pages/Representation.page';
// import * as uploadAppealForm from '../e2e/pages/UploadAppealForm.page';
// import * as uploadSupportingDocuments from '../e2e/pages/UploadSupportingDocuments.page';
// import * as uploadOtherInformation from '../e2e/pages/UploadOtherInformation.page';
// import * as checkYourAnswersPage from '../e2e/pages/CheckYourAnswers.page';

// const { I } = inject();

jest.retryTimes(20);
jest.setTimeout(5000);

const servicesToCheck = [
  { name: 'Base URL', url: process.env.SPTRIBS_FRONTEND_URL },
  { name: 'Special Tribunals Web', url: process.env.TEST_URL },
  { name: 'Special Tribunals Case API', url: config.get('services.sptribs.url') },
  { name: 'IDAM Web', url: config.get('services.idam.authorizationURL') },
  { name: 'IDAM API', url: config.get('services.idam.tokenURL') },
  { name: 'Auth Provider', url: config.get('services.authProvider.url') },
  { name: 'Equality and Diversity', url: config.get('services.equalityAndDiversity.url') },
  { name: 'Postcode Lookup', url: config.get('services.postcodeLookup.url') },
  { name: 'Fis DSS Update', url: config.get('services.fisDssUpdate.url') },
  { name: 'HMCTS Homepage', url: config.get('services.hmctsHomePage.url') },
  { name: 'RPE TOKEN', url: config.get('services.RPE_TOKEN.url') },
];

const checkService = async (url: string) => {
  const response = await axios.get(url);
  if (response.status !== 200 || response.data?.status !== 'UP') {
    throw new Error(`Status: ${response.status} Data: '${JSON.stringify(response.data)}'`);
  }
};

describe.each(servicesToCheck)('Required services should return 200 status UP', ({ name, url }) => {
  const parsedUrl = new URL('/health', url as string).toString();

  test(`${name}: ${parsedUrl}`, async () => {
    await expect(checkService(parsedUrl)).resolves.not.toThrow();
  });
});

describe('Homepage should redirect to IDAM', () => {
  test('Homepage', async () => {
    const checkHomepage = async () => {
      const response = await axios.get(process.env.TEST_URL as string);
      if (response.status !== 200 || !response.data.includes('password')) {
        throw new Error(`Status: ${response.status} Data: '${JSON.stringify(response.data)}'`);
      }
    };
    await expect(checkHomepage()).resolves.not.toThrow();
  });
});

// describe('Create an application with minimal details.', () => {
//   test('Run application', async (
//     landingPage,
//     loginPage,
//     subjectDetailsPage,
//     subjectContactDetailsPage,
//     representationPage,
//     uploadAppealForm,
//     uploadSupportingDocuments,
//     uploadOtherInformation,
//     checkYourAnswersPage,
//     ) => {
//       const pa11yTests = false;
//       const representationPresent = false;
//       const uploadOtherInfo = false;
//       await landingPage.seeTheLandingPage(pa11yTests);
//       await landingPage.continueOn();
//       await loginPage.SignInUser();
//       await subjectDetailsPage.fillInFields();
//       await subjectContactDetailsPage.fillInFields();
//       await representationPage.fillInFields(representationPresent);
//       await uploadAppealForm.uploadDocumentsSection();
//       await uploadSupportingDocuments.uploadDocumentsSection();
//       await uploadOtherInformation.uploadDocumentsSection(uploadOtherInfo);
//       await I.click('button[name="opt-out-button"]'); // opt out of PCQ
//       await checkYourAnswersPage.continueOn();
//   });
// });