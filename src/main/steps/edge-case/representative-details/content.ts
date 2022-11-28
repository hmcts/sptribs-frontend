import { EmailAddress } from '../../../app/case/definition';
import { TranslationFn } from '../../../app/controller/GetController';
import { FormContent } from '../../../app/form/Form';
import { isEmailValid, isFieldFilledIn, isPhoneNoValid } from '../../../app/form/validation';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';

export const form: FormContent = {
  fields: {
    representativeFullName: {
      type: 'text',
      classes: 'govuk-input',
      label: l => l.fullNameLabel,
      validator: isFieldFilledIn,
    },
    representativeOrganisationName: {
      type: 'text',
      classes: 'govuk-input',
      label: l => l.organisationNameLabel,
      validator: isFieldFilledIn,
    },
    representativeContactNumber: {
      type: 'text',
      classes: 'govuk-input',
      label: l => l.contactNumberLabel,

      validator: value => isFieldFilledIn(value) || isPhoneNoValid(value),
    },
    representativeEmailAddress: {
      type: 'text',
      classes: 'govuk-input',
      label: l => l.emailAddressLabel,

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
