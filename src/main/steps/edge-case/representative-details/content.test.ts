import { EmailAddress } from '../../../app/case/definition';
import { FormContent, FormFields, FormOptions } from '../../../app/form/Form';
import { isFieldFilledIn } from '../../../app/form/validation';
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
resourceLoader.Loader('representative-details');
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

const CommonContent = { language: EN } as CommonContent;
/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */
describe('representative-details-content', () => {
  test('should return correct english content', () => {
    const generatedContent = generateContent({ ...commonContent });
    expect(generatedContent.continue).toEqual(enContent.continue);
    expect(generatedContent.serviceName).toEqual(enContent.serviceName);
    expect(generatedContent.title).toEqual(enContent.title);
    expect(generatedContent.line1).toEqual(enContent.line1);
    expect(generatedContent.line2).toEqual(enContent.line2);
    expect(generatedContent.fullNameLabel).toEqual(enContent.fullNameLabel);
    expect(generatedContent.organisationNameLabel).toEqual(enContent.organisationNameLabel);
    expect(generatedContent.contactNumberLabel).toEqual(enContent.contactNumberLabel);
    expect(generatedContent.emailAddressLabel).toEqual(enContent.emailAddressLabel);
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
    expect(generatedContent.title).toEqual(cyContent.title);
    expect(generatedContent.line1).toEqual(cyContent.line1);
    expect(generatedContent.line2).toEqual(cyContent.line2);
    expect(generatedContent.fullNameLabel).toEqual(cyContent.fullNameLabel);
    expect(generatedContent.organisationNameLabel).toEqual(cyContent.organisationNameLabel);
    expect(generatedContent.contactNumberLabel).toEqual(cyContent.contactNumberLabel);
    expect(generatedContent.emailAddressLabel).toEqual(cyContent.emailAddressLabel);
    expect(generatedContent.hint).toEqual(cyContent.hint);
    expect(generatedContent.errors).toEqual(cyContent.errors);
  });

  test('should contain submit button', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;

    expect((form.submit.text as Function)(generateContent({ ...commonContent, language: EN }))).toBe('Continue');
  });

  it('should have an email input text field', () => {
    const generatedContent = generateContent(CommonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const representativeEmailAddress = fields.representativeEmailAddress;
    expect(representativeEmailAddress.classes).toBe('govuk-input');
    expect(representativeEmailAddress.type).toBe('text');

    const emailAddressOptions = fields.representativeEmailAddress as FormOptions;
    expect(emailAddressOptions.values[0].value).toBe(EmailAddress.EMAIL_ADDRESS);
    expect((emailAddressOptions.values[0].label as Function)(generatedContent)).toBe('Email address');
    expect((emailAddressOptions.validator as Function)('test@gmail.com')).toBe(undefined);
    expect((emailAddressOptions.validator as Function)('')).toBe('required');
    expect((emailAddressOptions.validator as Function)('notanemailaddress')).toBe('invalid');
  });

  test('should call validation function', () => {
    const generatedContent = generateContent(commonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const representativeFullName = fields.representativeFullName as FormOptions;
    const representativeOrganisationName = fields.representativeOrganisationName as FormOptions;
    expect((representativeFullName.label as Function)(generatedContent)).toBe(enContent.fullNameLabel);
    expect(representativeFullName.validator).toBe(isFieldFilledIn);
    expect((representativeOrganisationName.label as Function)(generatedContent)).toBe(enContent.organisationNameLabel);
    expect(representativeOrganisationName.validator).toBe(isFieldFilledIn);
  });

  it('should have a contact number text field', () => {
    const generatedContent = generateContent(CommonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const representativeContactNumber = fields.representativeContactNumber;
    expect(representativeContactNumber.classes).toBe('govuk-input');
    expect((representativeContactNumber.label as Function)(generatedContent)).toBe(enContent.contactNumberLabel);
    expect(representativeContactNumber.type).toBe('text');

    const contactNumberOptions = fields.representativeContactNumber as FormOptions;
    expect((contactNumberOptions.validator as Function)('07712345678')).toBe(undefined);
    expect((contactNumberOptions.validator as Function)('')).toBe('required');
    expect((contactNumberOptions.validator as Function)('notaphonenumber')).toBe('invalid');
  });
});
