import { FormContent, FormFields, FormOptions } from '../../../app/form/Form';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import { CommonContent } from '../../common/common.content';

import { generateContent } from './content';

const EN = 'en';
const CY = 'cy';

const commonContent = {
  language: EN,
  userCase: {},
} as CommonContent;

const resourceLoader = new ResourceReader();
resourceLoader.Loader('cica-reference-number');
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

describe('cica-reference-number-content', () => {
  test('should return correct english content', () => {
    const generatedContent = generateContent({ ...commonContent });
    expect(generatedContent.continue).toEqual(enContent.continue);
    expect(generatedContent.serviceName).toEqual(enContent.serviceName);
    expect(generatedContent.cicaReferenceNumberLabel).toEqual(enContent.cicaReferenceNumberLabel);
    expect(generatedContent.line1).toEqual(enContent.line1);
    expect(generatedContent.errors).toEqual(enContent.errors);
  });

  test('should return correct welsh content', () => {
    const generatedContent = generateContent({
      ...commonContent,
      language: CY,
    });

    expect(generatedContent.continue).toEqual(cyContent.continue);
    expect(generatedContent.serviceName).toEqual(cyContent.serviceName);
    expect(generatedContent.cicaReferenceNumberLabel).toEqual(cyContent.cicaReferenceNumberLabel);
    expect(generatedContent.line1).toEqual(cyContent.line1);
    expect(generatedContent.errors).toEqual(cyContent.errors);
  });
  /* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */
  test('should contain submit button', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;

    expect((form.submit?.text as Function)(generateContent({ ...commonContent, language: EN }))).toBe('Continue');
  });

  test('should call validation function', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const cicaReferenceNumber = fields.cicaReferenceNumber as FormOptions;
    expect((cicaReferenceNumber.label as Function)(generatedContent)).toBe(enContent.cicaReferenceNumberLabel);
    expect((cicaReferenceNumber.validator as Function)('testCicaRef123')).toBe(undefined);
  });

  test('should fail validation when CICA reference number contains invalid text (eg. html, markdown, null)', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const cicaReferenceNumber = fields.cicaReferenceNumber as FormOptions;

    expect((cicaReferenceNumber.validator as Function)('<marquee>testCicaRef123</marquee>')).toBe(
      'containsInvalidCharacters'
    );
    expect((cicaReferenceNumber.validator as Function)('[Click here](https://www.google.co.uk)')).toBe(
      'containsMarkdownLink'
    );
    expect((cicaReferenceNumber.validator as Function)(' ')).toBe('required');
  });
});

it('should use cy language translation and cover happy path', () => {
  const generatedContent = generateContent(commonContent);
  const form = generatedContent.form as FormContent;
  const fields = form.fields as FormFields;
  const cicaReferenceNumber = fields.cicaReferenceNumber as FormOptions;

  expect(generatedContent.title).toBe(enContent.title);
  expect((cicaReferenceNumber.validator as Function)('testCicaRef123')).toBe(undefined);
});

it('should use en language translation and cover happy path', () => {
  const generatedContent = generateContent(commonContent);
  const form = generatedContent.form as FormContent;
  const fields = form.fields as FormFields;
  const cicaReferenceNumber = fields.cicaReferenceNumber as FormOptions;

  expect(generatedContent.section).not.toBe('testCicaRef123');
  expect((cicaReferenceNumber.validator as Function)('testCicaRef123')).toBe(undefined);
});
