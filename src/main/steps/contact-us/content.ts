import { TranslationFn } from '../../app/controller/GetController';

export const en = {
  title: 'document submission service',
  email: 'Email',
  emailAddress:
    'Email us at <a href="mailto:CIC.enquiries@justice.gov.uk" class="govuk-link">CIC.enquiries@justice.gov.uk.</a>',
};

export const cy: typeof en = {
  title: 'Mabwysiadu',
  email: 'E-bost',
  emailAddress:
    'Anfonwch neges e-bost i <a href="mailto:CIC.enquiries@justice.gov.uk" class="govuk-link">CIC.enquiries@justice.gov.uk.</a>',
};

const languages = {
  en,
  cy,
};

export const generateContent: TranslationFn = content => {
  return languages[content.language];
};
