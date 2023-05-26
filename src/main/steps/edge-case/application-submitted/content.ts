import { TranslationFn } from '../../../app/controller/GetController';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';

const APPLICATION_SUBMITTED_TRANSLATION_FILE = 'application-submitted';

export const generateContent: TranslationFn = content => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader(APPLICATION_SUBMITTED_TRANSLATION_FILE);
  const Translations = resourceLoader.getFileContents().translations;
  const userCase = content.userCase!;
  const subjectEmail = userCase['subjectEmailAddress'];

  const en = () => {
    const caseId = userCase?.id?.toString().replace(/.{4}/g, '$& - ').substring(0, 25);
    return {
      ...Translations.en,
      referenceNumber: `<strong>Case Number:</font><br>${caseId}</strong>`,
      line2: 'An email will be sent to ' + subjectEmail + ', that explains what happens next.',
      line3:
        '<b>We would like to hear your thoughts</b><br>Complete this short 5-minutes survey to help improve our services for you and others <a class="govuk-link" href="https://www.smartsurvey.co.uk/s/SurveyExit/?service=Specials"target=_blank><br>Please leave your your feedback</a>',
    };
  };
  const cy = () => {
    const caseId = userCase?.id?.toString().replace(/.{4}/g, '$&-').substring(0, 19);
    return {
      ...Translations.cy,
      referenceNumber: `<strong>Case Number (in welsh):</font><br>${caseId}</strong>`,
      line2: 'An email will be sent to ' + subjectEmail + ', that explains what happens next. (in Welsh)',
    };
  };

  const languages = {
    en,
    cy,
  };

  const translations = languages[content.language]();
  return {
    ...translations,
  };
};
