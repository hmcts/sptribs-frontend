import { FormContent, FormFields, FormOptions } from '../../../app/form/Form';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import { CommonContent } from '../../common/common.content';

//import { form as subjectFullName } from './content';
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
resourceLoader.Loader('subject-details');
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

describe('subject-details-content', () => {
  test('should return correct english content', () => {
    const generatedContent = generateContent({ ...commonContent });
    expect(generatedContent.continue).toEqual(enContent.continue);
    expect(generatedContent.serviceName).toEqual(enContent.serviceName);
    expect(generatedContent.subjectFullNameLabel).toEqual(enContent.subjectFullNameLabel);
    expect(generatedContent.subjectDateOfBirthLabel).toEqual(enContent.subjectDateOfBirthLabel);
    expect(generatedContent.hint).toEqual(enContent.hint);
    expect(generatedContent.errors).toEqual(enContent.errors);
  });

  test('should return correct welsh content', () => {
    const generatedContent = generateContent({
      ...commonContent,
      language: CY,
    });

    expect(generatedContent.continue).toEqual(cyContent.continue);
    expect(generatedContent.serviceName).toEqual(cyContent.serviceName);
    expect(generatedContent.subjectFullNameLabel).toEqual(cyContent.subjectFullNameLabel);
    expect(generatedContent.subjectDateOfBirthLabel).toEqual(cyContent.subjectDateOfBirthLabel);
    expect(generatedContent.hint).toEqual(cyContent.hint);
    expect(generatedContent.errors).toEqual(cyContent.errors);
  });
  /* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */
  test('should contain submit button', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;

    expect((form.submit.text as Function)(generateContent({ ...commonContent, language: EN }))).toBe('Continue');
  });

  test('should call validation function', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const subjectFullName = fields.subjectFullName as FormOptions;
    expect((subjectFullName.label as Function)(generatedContent)).toBe(enContent.subjectFullNameLabel);
    expect((subjectFullName.validator as Function)("Dermot O'Leary")).toBe(undefined);
  });

  test('should fail validation when subject full name contains number', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const subjectFullName = fields.subjectFullName as FormOptions;

    expect((subjectFullName.validator as Function)('FirstName 1Surname')).toBe('invalid');
  });

  test('should fail validation when subject full name contains invalid punctuation', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const subjectFullName = fields.subjectFullName as FormOptions;

    expect((subjectFullName.validator as Function)('FirstName Surname!')).toBe('invalid');
  });

  test('should fail validation when subject full name contains invalid text (eg. html)', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const subjectFullName = fields.subjectFullName as FormOptions;

    expect((subjectFullName.validator as Function)('<marquee>John Doe</marquee>')).toBe('invalid');
  });

  test('should contain dateOfBirth field', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const dobField = fields.subjectDateOfBirth as FormOptions;

    expect(dobField.type).toBe('date');
    expect(dobField.classes).toBe('govuk-date-input');
    expect((dobField.label as Function)(generatedContent)).toBe(enContent.subjectDateOfBirthLabel);
    expect((dobField.hint as Function)(generatedContent)).toBe(enContent.hint);

    expect((dobField.values[0].label as Function)(generatedContent)).toBe('Day');
    expect(dobField.values[0].name).toBe('day');
    expect(dobField.values[0].classes).toBe('govuk-input--width-2');
    expect(dobField.values[0].attributes?.maxLength).toBe(2);

    expect((dobField.values[1].label as Function)(generatedContent)).toBe('Month');
    expect(dobField.values[1].name).toBe('month');
    expect(dobField.values[1].classes).toBe('govuk-input--width-2');
    expect(dobField.values[1].attributes?.maxLength).toBe(2);

    expect((dobField.values[2].label as Function)(generatedContent)).toBe('Year');
    expect(dobField.values[2].name).toBe('year');
    expect(dobField.values[2].classes).toBe('govuk-input--width-4');
    expect(dobField.values[2].attributes?.maxLength).toBe(4);

    expect(
      (dobField.parser as Function)({
        'subjectDateOfBirth-day': '21',
        'subjectDateOfBirth-month': '12',
        'subjectDateOfBirth-year': '2018',
      })
    ).toEqual({ day: '21', month: '12', year: '2018' });
    expect((dobField.validator as Function)({ day: '', month: '', year: '' })).toBe('required');
    expect((dobField.validator as Function)({ day: '1', month: '1', year: '1889' })).toBe('invalid');
  });
});

it('should use cy language translation and cover happy path', () => {
  const generatedContent = generateContent(commonContent);
  const form = generatedContent.form as FormContent;
  const fields = form.fields as FormFields;
  const subjectFullName = fields.subjectFullName as FormOptions;

  expect(generatedContent.title).toBe(enContent.title);
  expect((subjectFullName.validator as Function)('Firştnåmé Midğlø Lâßtnámê')).toBe(undefined);
});

it('should use en language translation and cover happy path', () => {
  const generatedContent = generateContent(commonContent);
  const form = generatedContent.form as FormContent;
  const fields = form.fields as FormFields;
  const subjectFullName = fields.subjectFullName as FormOptions;

  expect(generatedContent.section).not.toBe('Ceisydd');
  expect((subjectFullName.validator as Function)('Ceisydd')).toBe(undefined);
});

it('should use en language translation and cover error block', () => {
  const commonContent1 = { language: 'en', userCase: {} } as CommonContent;
  const generatedContent1 = generateContent(commonContent1);
  expect(generatedContent1.title).toBe(enContent.title);
});

it('should use cy language translation and cover error block', () => {
  const commonContent1 = { language: 'en', userCase: {} } as CommonContent;
  const generatedContent1 = generateContent(commonContent1);
  expect(generatedContent1.section).not.toBe('Ceisydd');
});
