import { TranslationFn } from '../../app/controller/GetController';
import { FormContent } from '../../app/form/Form';
import { isInvalidPostcode } from '../../app/form/validation';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';

export const form: FormContent = {
  fields: {
    postcode: {
      type: 'text',
      classes: 'govuk-input govuk-input--width-10',
      label: l => l.postcodeLabel,
      validator: isInvalidPostcode,
    },
  },
  submit: {
    text: l => l.continue,
  },
};

export const generateContent: TranslationFn = content => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('cica-postcode-verification');
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
  const translations = languages[content.language] ? languages[content.language]() : languages['en']();
  return {
    ...translations,
    form,
  };
};
