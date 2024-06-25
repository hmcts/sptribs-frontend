import { CaseDate } from '../../../app/case/case';
import { TranslationFn } from '../../../app/controller/GetController';
import { FormContent } from '../../../app/form/Form';
import { covertToDateObject } from '../../../app/form/parser';
import {
  isDateInputInvalid,
  isDateInputNotFilled,
  isFieldFilledIn,
  isFutureDate,
  isMarkDownLinkIncluded,
  isObsoleteDate,
} from '../../../app/form/validation';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';

export const form: FormContent = {
  fields: {
    subjectFullName: {
      type: 'text',
      classes: 'govuk-input',
      label: l => l.subjectFullNameLabel,
      validator: input => isFieldFilledIn(input) || isMarkDownLinkIncluded(input),
    },
    subjectDateOfBirth: {
      type: 'date',
      classes: 'govuk-date-input',
      label: l => l.subjectDateOfBirthLabel,
      hint: l => l.hint,
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
      parser: body => covertToDateObject('subjectDateOfBirth', body as Record<string, unknown>),
      validator: value => {
        const date = value as CaseDate;

        return isDateInputInvalid(date) && isDateInputNotFilled(date)
          ? 'invalidAndIncomplete'
          : isDateInputInvalid(date)
          ? isDateInputInvalid(date)
          : isDateInputNotFilled(date)
          ? isDateInputNotFilled(date)
          : isFutureDate(date)
          ? isFutureDate(date)
          : isObsoleteDate(date)
          ? isObsoleteDate(date)
          : undefined;
      },
    },
  },
  submit: {
    text: l => l.continue,
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
