import languageAssertions from '../../../../test/unit/utils/languageAssertions';
import { EmailAddress } from '../../../app/case/definition';
import { FormContent, FormFields, FormOptions } from '../../../app/form/Form';
import { isFieldFilledIn } from '../../../app/form/validation';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import { CommonContent } from '../../common/common.content';

import { generateContent } from './content';

const resourceLoader = new ResourceReader();
resourceLoader.Loader('subject-contact-details');
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

const EN = 'en';
//const CY = 'cy';

const CommonContent = { language: EN } as CommonContent;
/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */
describe('Email Address', () => {
  it('should return the correct content for language = en', () => {
    languageAssertions('en', enContent, () => generateContent(CommonContent));
  });

  //const commonContent = { language: CY } as CommonContent;
  it('should return the correct content for language = cy', () => {
    languageAssertions('cy', cyContent, () => generateContent({ ...CommonContent, language: 'cy' }));
  });

  it('should have an email input text field', () => {
    const generatedContent = generateContent(CommonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const subjectEmailAddress = fields.subjectEmailAddress;
    expect(subjectEmailAddress.classes).toBe('govuk-input');
    expect((subjectEmailAddress.label as Function)(generatedContent)).toBe(enContent.emailAddressLabel);
    expect((subjectEmailAddress.hint as Function)(generatedContent)).toBe(enContent.emailAddressHint);
    expect(subjectEmailAddress.type).toBe('text');

    const emailAddressOptions = fields.subjectEmailAddress as FormOptions;
    expect(emailAddressOptions.values[0].value).toBe(EmailAddress.EMAIL_ADDRESS);
    expect((emailAddressOptions.values[0].label as Function)(generatedContent)).toBe('Insert email address');
    expect((emailAddressOptions.validator as Function)('test@gmail.com')).toBe(undefined);
    expect((emailAddressOptions.validator as Function)('')).toBe('required');
    expect((emailAddressOptions.validator as Function)('notanemailaddress')).toBe('invalid');
  });

  it('should have a contact number text field', () => {
    const generatedContent = generateContent(CommonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const subjectContactNumber = fields.subjectContactNumber;
    expect(subjectContactNumber.classes).toBe('govuk-input');
    expect((subjectContactNumber.label as Function)(generatedContent)).toBe(enContent.contactNumberLabel);
    expect((subjectContactNumber.hint as Function)(generatedContent)).toBe(enContent.contactNumberHint);
    expect(subjectContactNumber.type).toBe('text');

    const contactNumberOptions = fields.subjectContactNumber as FormOptions;
    expect((contactNumberOptions.validator as Function)('07712345678')).toBe(undefined);
    expect((contactNumberOptions.validator as Function)('')).toBe('required');
    expect((contactNumberOptions.validator as Function)('notaphonenumber')).toBe('invalid');
  });

  it('should contain Agree to be contacted checkbox field', () => {
    const generatedContent = generateContent(CommonContent);
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const subjectAgreeContact = fields.subjectAgreeContact;
    expect(subjectAgreeContact.type).toBe('checkboxes');
    expect(subjectAgreeContact.classes).toBe('govuk-checkboxes');
    expect((subjectAgreeContact.label as Function)(generatedContent)).toBe(enContent.agreeContactLabel);
    expect(subjectAgreeContact.validator).toBe(isFieldFilledIn);
  });

  it('should contain submit button', () => {
    const generatedContent = generateContent(CommonContent);
    const form = generatedContent.form as FormContent;

    expect((form.submit.text as Function)(generateContent({ ...CommonContent, language: EN }))).toBe('Continue');
  });
});
