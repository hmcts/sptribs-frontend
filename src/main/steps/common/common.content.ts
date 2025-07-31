import { capitalize } from 'lodash';

import { CaseWithId } from '../../app/case/case';
import { Fee } from '../../app/case/definition';
import { Eligibility } from '../../app/controller/AppRequest';
import { PageContent, TranslationFn } from '../../app/controller/GetController';

const en = {
  phase: 'Beta',
  serviceName: 'Appeal to the First-tier Tribunal',
  feedback:
    "<b> Help us improve this service </b><br>This is a new service. Help us for others to improve it by <a  class='govuk-link' href='https://www.smartsurvey.co.uk/s/Specials_Feedback?pageurl=currentUrl'target=_blank>giving your feedback</a>",
  languageToggle: '<a href="?lng=cy" class="govuk-link language">Cymraeg</a>',
  govUk: 'GOV.UK',
  errorPrefix: 'Error:',
  back: 'Back',
  continue: 'Continue',
  next: 'Next',
  change: 'Change',
  upload: 'Upload',
  download: 'Download',
  delete: 'Delete',
  warning: 'Warning',
  required: 'You have not answered the question. You need to select an answer before continuing.',
  notAnswered: 'You have not answered the question.',
  errorSaving: 'We’re having technical problems saving your application. Try again in a few minutes.',
  errorSendingInvite:
    'Sorry, we’re having technical problems sending your application for review. Please try again in a few minutes.',
  ogl: 'All content is available under the <a class="govuk-footer__link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Open Government Licence v3.0</a>, except where otherwise stated',
  copyright: '© Crown copyright',
  errorSummaryHeading: 'There is a problem',
  saveAndSignOut: 'Save and sign out',
  saveAsDraft: 'Save as draft',
  cancel: 'Cancel',
  signOut: 'Sign out',
  signIn: 'Sign in',
  accessibility: 'Accessibility statement',
  cookies: 'Cookies',
  privacyPolicy: 'Privacy policy',
  termsAndConditions: 'Terms and conditions',
  contactUs: 'Contact us',
  marriage: 'marriage',
  divorce: 'divorce',
  civilPartnership: 'civil partnership',
  endingCivilPartnership: 'ending a civil partnership',
  husband: 'husband',
  wife: 'wife',
  partner: 'partner',
  civilPartner: 'civil partner',
  withHim: 'with him',
  withHer: 'with her',
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  dateFormat: {
    day: 'Day',
    month: 'Month',
    year: 'Year',
  },
  yes: 'Yes',
  no: 'No',
  notSure: 'Not sure',
  english: 'English',
  welsh: 'Welsh',
  webChat: 'Web chat',
  webChatDetails: 'Get some help by messaging an agent online',
  webChatLink: 'Start webchat',
  email: 'Email',
  emailDetails: 'Email the department and we will get back to you in due course',
  contactEmail: 'cic.enquiries@justice.gov.uk',
  telephone: 'Telephone',
  telephoneNumber: '0300 790 6234',
  telephoneDetails: 'Talk to one of our agents now over the phone',
  telephoneOpenDetails: 'Monday to Friday, 8:30am to 5pm',
  telephoneClosureDetails: 'Closed weekends and Scottish bank holidays',
  telephoneCallCharges: 'Find out about call charges',
  telephoneCallChargesLink: 'https://www.gov.uk/call-charges',
  byPost: 'By post',
  byPostAddressTo: 'First-tier Tribunal (Criminal Injuries Compensation)',
  byPostBuilding: 'The Glasgow Tribunals Centre',
  byPostAddress: '20 York Street',
  byPostAddressRegion: 'Glasgow',
  byPostAddressPostcode: 'G2 8GT',
  habitualResidentHelpText1:
    'This may include working, owning property, having children in school, and your main family life taking place in England or Wales.',
  habitualResidentHelpText2:
    'The examples above aren’t a complete list of what makes up habitual residence, and just because some of them apply to you doesn’t mean you’re habitually resident. If you’re not sure, you should get legal advice.',
  cookiesHeading: 'Cookies on',
  cookiesLine1: 'We use some essential cookies to make this service work.',
  cookiesLine2:
    'We’d also like to use analytics cookies so we can understand how you use the service and make improvements.',
  acceptAnalyticsCookies: 'Accept analytics cookies',
  rejectAnalyticsCookies: 'Reject analytics cookies',
  viewCookies: 'View cookies',
  hideMessage: 'Hide this message',
  cookiesConfirmationMessage:
    '<p class="govuk-body">You can <a class="govuk-link" href="/cookies">change your cookie settings</a> at any time.</p>',
  changeCookiesHeading: 'Change your cookie settings',
  allowAnalyticsCookies: 'Allow cookies that measure website use?',
  useAnalyticsCookies: 'Use cookies that measure my website use',
  doNotUseAnalyticsCookies: 'Do not use cookies that measure my website use',
  save: 'Save',
  cookiesSaved: 'Your cookie settings were saved',
  additionalCookies:
    'Government services may set additional cookies and, if so, will have their own cookie policy and banner.',
  goToHomepage: 'Go to homepage',
  apmCookiesHeadings: 'Allow cookies that measure website application performance monitoring?',
  useApmCookies: 'Use cookies that measure website application performance monitoring',
  doNotUseApmCookies: 'Do not use cookies that measure website application performance monitoring',
};

const cy: typeof en = {
  ...en, // @TODO delete me to get a list of missing translations
  phase: 'Beta',
  serviceName: 'Apelio i’r Tribiwnlys Haen Gyntaf',
  feedback:
    "<b>Helpwch ni i wella’r gwasanaeth hwn</b><br> Mae hwn yn wasanaeth newydd. Helpwch ni ei wella i bobl eraill trwy <a class='govuk-link' href='https://www.smartsurvey.co.uk/s/Specials_Feedback/?pageurl=currentUrl' target=_blank>roi eich adborth</a>",
  languageToggle: '<a href="?lng=en" class="govuk-link language">English</a>',
  govUk: 'GOV.UK',
  errorPrefix: 'Gwall:',
  back: 'Yn ôl',
  continue: 'Parhau',
  change: 'Newid',
  upload: 'Uwchlwytho',
  download: 'Llwytho i lawr',
  delete: 'Dileu',
  warning: 'Rhybudd',
  required: 'Nid ydych wedi ateb y cwestiwn. Rhaid ichi ddewis ateb cyn symud ymlaen.',
  notAnswered: 'Nid ydych wedi ateb y cwestiwn.',
  errorSaving:
    'Rydym yn cael problemau technegol wrth geisio cadw eich cais. Rhowch gynnig arall arni ymhen ychydig o funudau.',
  ogl: 'Mae’r holl gynnwys ar gael o dan <a class="govuk-footer__link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license" >Drwydded Agored y Llywodraeth f3.0</a>, oni nodir fel arall',
  copyright: '© Hawlfraint y Goron',
  errorSummaryHeading: 'Mae yna broblem',
  saveAndSignOut: 'Cadw ac allgofnodi',
  saveAsDraft: 'Cadw fel drafft',
  save: 'Cadw',
  signOut: 'Allgofnodi',
  signIn: 'Mewngofnodi',
  accessibility: 'Datganiad Hygyrchedd',
  cookies: 'Cwcis',
  privacyPolicy: 'Polisi Preifatrwydd',
  termsAndConditions: 'Telerau ac Amodau',
  contactUs: 'Cysylltu â ni',
  marriage: 'priodas',
  divorce: 'ysgariad',
  endingCivilPartnership: 'dod â phartneriaeth sifil i ben',
  civilPartnership: 'partneriaeth sifil',
  husband: 'gŵr',
  wife: 'gwraig',
  partner: 'partner',
  civilPartner: 'partner sifil',
  withHim: 'gydag ef',
  withHer: 'gyda hi',
  months: [
    'Ionawr',
    'Chwefror',
    'Mawrth',
    'Ebrill',
    'Mai',
    'Mehefin',
    'Gorffennaf',
    'Awst',
    'Medi',
    'Hydref',
    'Tachwedd',
    'Rhagfyr',
  ],
  dateFormat: {
    day: 'Diwrnod',
    month: 'Mis',
    year: 'Blwyddyn',
  },
  yes: 'Do',
  no: 'Naddo',
  notSure: 'Ddim yn siŵr',
  english: 'Saesneg',
  welsh: 'Cymraeg',
  webChat: 'Sgwrsio dros y we',
  webChatDetails: 'Gofynnwch am gymorth drwy anfon neges at asiant ar-lein.',
  email: 'E-bost',
  emailDetails: 'E-bostiwch yr adran a gwnawn gysylltu â chi maes o law.',
  telephone: 'Ffôn',
  telephoneNumber: '0300 790 6234',
  telephoneDetails: 'Siaradwch gydag un o’n hasiantau nawr dros y ffôn',
  telephoneOpenDetails: 'Dydd Llun i ddydd Gwener, 8:30am - 5pm',
  telephoneClosureDetails: 'Ynghau ar benwythnos a gŵyl banc yn yr Alban',
  telephoneCallCharges: 'Gwybodaeth am gost galwadau',
  telephoneCallChargesLink: 'https://www.gov.uk/costau-galwadau',
  byPost: 'Drwy’r post',
  byPostAddressTo: 'First-tier Tribunal (Criminal Injuries Compensation)',
  byPostBuilding: 'The Glasgow Tribunals Centre',
  byPostAddress: '20 York Street',
  byPostAddressRegion: 'Glasgow',
  byPostAddressPostcode: 'G2 8GT',
  cookiesHeading: 'Cwcis ar',
  cookiesLine1: "Rydym yn defnyddio cwcis hanfodol i wneud i'r gwasanaeth hwn weithio.",
  cookiesLine2:
    "Rydym hefyd yn defnyddio cwcis dadansoddol fel y gallwn ddeall sut rydych yn defnyddio'r gwasanaeth a pha welliannau y gallwn eu gwneud.",
  acceptAnalyticsCookies: 'Derbyn cwcis ychwanegol',
  rejectAnalyticsCookies: 'Gwrthod cwcis ychwanegol',
  viewCookies: 'Gweld cwcis',
  hideMessage: "Cuddio'r neges cwcihon",
  cookiesConfirmationMessage:
    '<p class="govuk-body">Gallwch <a class="govuk-link" href="/cookies">newid gosodiadau eich cwcis ar</a> unrhyw adeg.</p>',
  changeCookiesHeading: 'Newid eich gosodiadau cwcis',
  allowAnalyticsCookies: 'Caniatáu cwcis sy’n mesur defnydd o’r wefan?',
  useAnalyticsCookies: 'Defnyddio cwcis sy’n mesur fy nefnydd o’r wefan',
  doNotUseAnalyticsCookies: 'Peidio â defnyddio cwcis sy’n mesur fy nefnydd o’r wefan',
  apmCookiesHeadings: 'Caniatáu cwcis sy’n mesur y broses o fonitro perfformiad gwefannau?',
  useApmCookies: 'Defnyddio cwcis sy’n mesur y broses o fonitro perfformiad gwefannau',
  doNotUseApmCookies: 'Peidio â defnyddio cwcis sy’n mesur y broses o fonitro perfformiad gwefannau',
};

export const generatePageContent = ({
  language,
  pageContent,
  userCase,
  uploadedDocuments,
  supportingDocuments,
  otherInformation,
  userEmail,
  addresses = [],
  fee,
}: {
  language: Language;
  pageContent?: TranslationFn;
  userCase?: Partial<CaseWithId>;
  uploadedDocuments?: any;
  supportingDocuments?: any;
  otherInformation?: any;
  userEmail?: string;
  addresses?: [];
  fee?: Fee;
}): PageContent => {
  const commonTranslations: typeof en = language === 'en' ? en : cy;
  const serviceName = getServiceName(commonTranslations);

  const content: CommonContent = {
    ...commonTranslations,
    serviceName,
    language,
    userCase,
    uploadedDocuments,
    supportingDocuments,
    otherInformation,
    userEmail,
    addresses,
    fee,
  };

  if (pageContent) {
    Object.assign(content, pageContent(content));
  }

  return content;
};

const getServiceName = (translations: typeof en): string => {
  return capitalize(translations.serviceName);
};

export type CommonContent = typeof en & {
  language: Language;
  serviceName: string;
  pageContent?: TranslationFn;
  userCase?: Partial<CaseWithId>;
  uploadedDocuments?: any;
  supportingDocuments?: any;
  otherInformation?: any;
  userEmail?: string;
  contactEmail?: string;
  referenceNumber?: string;
  addresses?: any[];
  eligibility?: Eligibility;
  fee?: Fee;
};

export type Language = 'en' | 'cy';
