import { EmailAddress } from '../../../app/case/definition';
import { TranslationFn } from '../../../app/controller/GetController';
import { FormContent } from '../../../app/form/Form';
import {
  containsInvalidCharacters,
  isEmailValid,
  isFieldFilledIn,
  isMarkDownLinkIncluded,
  isPhoneNoValid,
} from '../../../app/form/validation';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';

export const form: FormContent = {
  fields: {
    representativeFullName: {
      type: 'text',
      classes: 'govuk-input',
      label: l => l.fullNameLabel,
      validator: input => isFieldFilledIn(input) || isMarkDownLinkIncluded(input) || containsInvalidCharacters(input),
    },
    representativeOrganisationName: {
      type: 'text',
      classes: 'govuk-input',
      label: l => l.organisationNameLabel,
      validator: input => isFieldFilledIn(input) || isMarkDownLinkIncluded(input) || containsInvalidCharacters(input),
    },
    representativeContactNumber: {
      type: 'text',
      classes: 'govuk-input',
      label: l => l.contactNumberLabel,
      hint: l => l.contactNumberHint,

      validator: value => isFieldFilledIn(value) || isPhoneNoValid(value),
    },
    representativeEmailAddress: {
      type: 'text',
      classes: 'govuk-input',
      label: l => l.emailAddressLabel,
      hint: l => l.emailAddressHint,

      values: [{ label: l => l.emailAddressLabel, value: EmailAddress.EMAIL_ADDRESS }],
      validator: value => isFieldFilledIn(value) || isEmailValid(value),
    },
  },
  submit: {
    text: l => l.continue,
  },
};

export const generateContent: TranslationFn = content => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('representative-details');
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
