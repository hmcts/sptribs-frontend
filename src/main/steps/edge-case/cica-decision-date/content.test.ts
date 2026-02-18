import { FormContent, FormFields, FormOptions } from '../../../app/form/Form';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import { CommonContent } from '../../common/common.content';

import { generateContent } from './content';

const EN = 'en';
const CY = 'cy';

const commonContent = {
  language: EN,
  userCase: {},
  dateFormat: {
    day: 'Day',
    month: 'Month',
    year: 'Year',
  },
} as CommonContent;

const resourceLoader = new ResourceReader();
resourceLoader.Loader('cica-decision-date');
const translations = resourceLoader.getFileContents().translations;
const errors = resourceLoader.getFileContents().errors;

const enContent = {
  ...translations.en,
  errors: {
    ...errors.en,
  },
};

const cyContent = {
  ...translations.cy,
  errors: {
    ...errors.cy,
  },
};

describe('cica-decision-date-content', () => {
  test('should return correct english content', () => {
    const generatedContent = generateContent({ ...commonContent });
    expect(generatedContent.continue).toEqual(enContent.continue);
    expect(generatedContent.serviceName).toEqual(enContent.serviceName);
    expect(generatedContent.title).toEqual(enContent.title);
    expect(generatedContent.line1).toEqual(enContent.line1);
    expect(generatedContent.dateOfCicaInitialReviewDecisionLetterLabel).toEqual(
      enContent.dateOfCicaInitialReviewDecisionLetterLabel
    );
    expect(generatedContent.hint).toEqual(enContent.hint);
    expect(generatedContent.day).toEqual(enContent.day);
    expect(generatedContent.month).toEqual(enContent.month);
    expect(generatedContent.year).toEqual(enContent.year);
    expect(generatedContent.errors).toEqual(enContent.errors);
  });

  test('should return correct welsh content', () => {
    const generatedContent = generateContent({
      ...commonContent,
      language: CY,
    });

    expect(generatedContent.continue).toEqual(cyContent.continue);
    expect(generatedContent.serviceName).toEqual(cyContent.serviceName);
    expect(generatedContent.title).toEqual(cyContent.title);
    expect(generatedContent.line1).toEqual(cyContent.line1);
    expect(generatedContent.dateOfCicaInitialReviewDecisionLetterLabel).toEqual(
      cyContent.dateOfCicaInitialReviewDecisionLetterLabel
    );
    expect(generatedContent.hint).toEqual(cyContent.hint);
    expect(generatedContent.day).toEqual(cyContent.day);
    expect(generatedContent.month).toEqual(cyContent.month);
    expect(generatedContent.year).toEqual(cyContent.year);
    expect(generatedContent.errors).toEqual(cyContent.errors);
  });
  /* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */
  test('should contain submit button', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;

    expect((form.submit?.text as Function)(generateContent({ ...commonContent, language: EN }))).toBe('Continue');
  });

  test('should contain initialCicaDecisionDate field', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const initialCicaDecisionDateField = fields.initialCicaDecisionDate as FormOptions;

    expect(initialCicaDecisionDateField.type).toBe('date');
    expect(initialCicaDecisionDateField.classes).toBe('govuk-date-input');
    expect((initialCicaDecisionDateField.label as Function)(generatedContent)).toBe(
      enContent.dateOfCicaInitialReviewDecisionLetterLabel
    );
    expect((initialCicaDecisionDateField.hint as Function)(generatedContent)).toBe(enContent.hint);

    expect((initialCicaDecisionDateField.values[0].label as Function)(generatedContent)).toBe('Day');
    expect(initialCicaDecisionDateField.values[0].name).toBe('day');
    expect(initialCicaDecisionDateField.values[0].classes).toBe('govuk-input--width-2');
    expect(initialCicaDecisionDateField.values[0].attributes?.maxLength).toBe(2);

    expect((initialCicaDecisionDateField.values[1].label as Function)(generatedContent)).toBe('Month');
    expect(initialCicaDecisionDateField.values[1].name).toBe('month');
    expect(initialCicaDecisionDateField.values[1].classes).toBe('govuk-input--width-2');
    expect(initialCicaDecisionDateField.values[1].attributes?.maxLength).toBe(2);

    expect((initialCicaDecisionDateField.values[2].label as Function)(generatedContent)).toBe('Year');
    expect(initialCicaDecisionDateField.values[2].name).toBe('year');
    expect(initialCicaDecisionDateField.values[2].classes).toBe('govuk-input--width-4');
    expect(initialCicaDecisionDateField.values[2].attributes?.maxLength).toBe(4);

    expect(
      (initialCicaDecisionDateField.parser as Function)({
        'initialCicaDecisionDate-day': '21',
        'initialCicaDecisionDate-month': '12',
        'initialCicaDecisionDate-year': '2018',
      })
    ).toEqual({ day: '21', month: '12', year: '2018' });
    expect((initialCicaDecisionDateField.validator as Function)({ day: '21', month: '12', year: '2018' })).toBe(
      undefined
    );
    expect((initialCicaDecisionDateField.validator as Function)({ day: '', month: '', year: '' })).toBe(
      'incompleteDayAndMonthAndYear'
    );
    expect((initialCicaDecisionDateField.validator as Function)({ day: 'ab', month: '', year: '2000' })).toBe(
      'invalidAndIncomplete'
    );
  });
});

it('should use en language translation and cover error block', () => {
  const commonContent1 = { language: 'en', userCase: {} } as CommonContent;
  const generatedContent1 = generateContent(commonContent1);
  expect(generatedContent1.title).toBe(enContent.title);
});

it('should use cy language translation and cover error block', () => {
  const commonContent1 = { language: 'cy', userCase: {} } as CommonContent;
  const generatedContent1 = generateContent(commonContent1);
  expect(generatedContent1.title).toBe(cyContent.title);
});
