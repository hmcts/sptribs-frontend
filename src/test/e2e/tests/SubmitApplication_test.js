const ContactPreferencePage = require("../pages/ContactPreference.page");

Feature('Create application @e2e-tests');

Scenario(
  'Create full application and submit',
  async ({
    landingPage,
    loginPage,
    subjectDetailsPage,
    subjectContactDetailsPage,
    representationPage,
    //dateofbirth,
    //addresswithpostcode,
    //uploadfilepage,
    //determineapplicantrole,
    //statementoftruth,
    //contactpreferencepage,
    //additiondocumentpage,
    //emailaddresspage,
    //checkyouranswerspage,
    //contactnumber,
    //thankyoupage,
  }) => {
    await landingPage.seeTheLandingPage();
    await loginPage.SignInUser();
    await subjectDetailsPage.checkPageLoads();
    await subjectDetailsPage.fillInFields();
    await subjectContactDetailsPage.checkPageLoads();
    await subjectContactDetailsPage.fillInFields();
    await representationPage.checkPageLoads();
    await representationPage.fillInFields();
    // await dateofbirth.dateSelection('10', '10', '2020');
    // await addresswithpostcode.PostCodeLookUpAndSelect();
    // await contactpreferencepage.contactPreference();
    // await emailaddresspage.emailAddress();
    // await contactnumber.EnterHomeAndMobileNo('4423232323232', '4423232323232');
    //await uploadfilepage.uploadDocumentsSection();
    //await additiondocumentpage.uploadDocumentsSection();
    //await checkyouranswerspage.checkyouranswers();
    //await statementoftruth.statementOfTruth();
    //await thankyoupage.applicationsubmission();
  }
);
