import { EmailAddress } from '../../../app/case/definition';
import { TranslationFn } from '../../../app/controller/GetController';
import { FormContent } from '../../../app/form/Form';
import { isEmailValid, isFieldFilledIn, isPhoneNoValid } from '../../../app/form/validation';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';

export const form: FormContent = {
  fields: {
    subjectEmailAddress: {
      type: 'text',
      classes: 'govuk-input',
      label: l => l.emailAddressLabel,
      hint: h => h.emailAddressHint,

      values: [{ label: l => l.emailAddress, value: EmailAddress.EMAIL_ADDRESS }],
      validator: value => isFieldFilledIn(value) || isEmailValid(value),
    },
    subjectContactNumber: {
      type: 'text',
      classes: 'govuk-input',
      label: l => l.contactNumberLabel,
      hint: h => h.contactNumberHint,

      validator: value => {
        if (isFieldFilledIn(value)) {
          return isFieldFilledIn(value);
        } else if (isPhoneNoValid(value)) {
          return isPhoneNoValid(value);
        }
      },
    },
    subjectAgreeContact: {
      name: 'agree',
      type: 'checkboxes',
      classes: 'govuk-checkboxes',
      values: [{ name: 'subjectAgreeContact', label: l => l.agreeContactLabel, value: 'Yes' }],
      validator: isFieldFilledIn,
    },
  },
  submit: {
    text: l => l.continue,
  },
};

export const generateContent: TranslationFn = content => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('subject-contact-details');
  const Translations = resourceLoader.getFileContents().translations;
  const errors = resourceLoader.getFileContents().errors;

  const en = () => {
    return {
      ...Translations.en,
      errors: {
        ...errors.en,
      },
    };
  };
  const cy = () => {
    return {
      ...Translations.cy,
      errors: {
        ...errors.cy,
      },
    };
  };

  const languages = {
    en,
    cy,
  };
  const translations = languages[content.language]();
  return {
    ...translations,
    form,
  };
};
