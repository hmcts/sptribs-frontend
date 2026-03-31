import { YesOrNo } from '../../app/case/definition';
import { TranslationFn } from '../../app/controller/GetController';
import { FormContent } from '../../app/form/Form';
import { isFieldFilledIn } from '../../app/form/validation';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';

export const form: FormContent = {
  fields: {
    startNewAppeal: {
      type: 'radios',
      classes: 'govuk-radios',
      label: l => l.label,
      values: [
        { label: l => l.one, value: YesOrNo.YES },
        { label: l => l.two, value: YesOrNo.NO },
      ],
      validator: isFieldFilledIn,
    },
  },
  submit: {
    text: l => l.continue,
  },
};

export const generateContent: TranslationFn = content => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('cica-confirm-new');
  const Translations = resourceLoader.getFileContents().translations;
  const errors = resourceLoader.getFileContents().errors;

  // Get the CICA reference number from session
  const cicaReference = content.userCase?.cicaReferenceNumber || '';

  const en = () => {
    return {
      ...Translations.en,
      line1: `${Translations.en.line1Part1}${cicaReference}${Translations.en.line1Part2}`,
      errors: {
        ...errors.en,
      },
    };
  };
  const cy = () => {
    return {
      ...Translations.cy,
      line1: `${Translations.cy.line1Part1}${cicaReference}${Translations.cy.line1Part2}`,
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
