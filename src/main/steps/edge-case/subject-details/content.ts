import { CaseDate } from '../../../app/case/case';
import { TranslationFn } from '../../../app/controller/GetController';
import { FormContent } from '../../../app/form/Form';
import { covertToDateObject } from '../../../app/form/parser';
import {
  isDateInputFilled,
  isDateInputInvalid,
  isFieldFilledIn,
  isFutureDate,
  isObsoleteDate,
} from '../../../app/form/validation';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';

export const form: FormContent = {
  fields: {
    subjectFullName: {
      type: 'text',
      classes: 'govuk-input',
      label: l2 => l2.subjectFullNameLabel,
      validator: isFieldFilledIn,
    },
    subjectDateOfBirth: {
      type: 'date',
      classes: 'govuk-date-input',
      label: ml => ml.subjectDateOfBirthLabel,
      hint: ml => ml.hint,
      values: [
        {
          label: ml => ml.dateFormat['day'],
          name: 'day',
          classes: 'govuk-input--width-2',
          attributes: { maxLength: 2, pattern: '[0-9]*', inputMode: 'numeric' },
        },
        {
          label: ml => ml.dateFormat['month'],
          name: 'month',
          classes: 'govuk-input--width-2',
          attributes: { maxLength: 2, pattern: '[0-9]*', inputMode: 'numeric' },
        },
        {
          label: ml => ml.dateFormat['year'],
          name: 'year',
          classes: 'govuk-input--width-4',
          attributes: { maxLength: 4, pattern: '[0-9]*', inputMode: 'numeric' },
        },
      ],
      parser: body => covertToDateObject('subjectDateOfBirth', body as Record<string, unknown>),
      validator: value => {
        if (isDateInputFilled(value as CaseDate)) {
          return 'required';
        }

        if (
          isDateInputInvalid(value as CaseDate) ||
          isFutureDate(value as CaseDate) ||
          isObsoleteDate(value as CaseDate)
        ) {
          return 'invalid';
        }
      },
    },
  },
  submit: {
    text: ml => ml.continue,
  },
};

export const generateContent: TranslationFn = content => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('subject-details');
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
