import { CaseDate } from '../../../app/case/case';
import { TranslationFn } from '../../../app/controller/GetController';
import { FormContent } from '../../../app/form/Form';
import { convertToDateObject } from '../../../app/form/parser';
import { isDateInputInvalid, isDateInputNotFilled } from '../../../app/form/validation';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';

export const form: FormContent = {
  fields: {
    initialCicaDecisionDate: {
      type: 'date',
      classes: 'govuk-date-input',
      hint: l => l.hint,
      label: l => l.dateOfCicaInitialReviewDecisionLetterLabel,
      values: [
        {
          label: l => l.day,
          name: 'day',
          classes: 'govuk-input--width-2',
          attributes: { maxLength: 2, pattern: '[0-9]*', inputMode: 'numeric' },
        },
        {
          label: l => l.month,
          name: 'month',
          classes: 'govuk-input--width-2',
          attributes: { maxLength: 2, pattern: '[0-9]*', inputMode: 'numeric' },
        },
        {
          label: l => l.year,
          name: 'year',
          classes: 'govuk-input--width-4',
          attributes: { maxLength: 4, pattern: '[0-9]*', inputMode: 'numeric' },
        },
      ],
      parser: body => convertToDateObject('initialCicaDecisionDate', body as Record<string, unknown>),
      validator: value => {
        const date = value as CaseDate;
        if (isDateInputInvalid(date) && isDateInputNotFilled(date)) {
          return 'invalidAndIncomplete';
        } else if (isDateInputInvalid(date)) {
          return isDateInputInvalid(date);
        } else if (isDateInputNotFilled(date)) {
          return isDateInputNotFilled(date);
        } else {
          return undefined;
        }
      },
    },
  },
  submit: {
    text: l => l.continue,
  },
};

export const generateContent: TranslationFn = content => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('cica-decision-date');
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
