import languageAssertions from '../../../test/unit/utils/languageAssertions';
import { FormFields } from '../../app/form/Form';
import { isInvalidPostcode } from '../../app/form/validation';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';
import { CommonContent, generatePageContent } from '../common/common.content';

import { form, generateContent } from './content';

jest.mock('../../app/form/validation');

const TRANSLATION_FILE = 'cica-postcode-verification';

const resourceLoader = new ResourceReader();
resourceLoader.Loader(TRANSLATION_FILE);

const translations = resourceLoader.getFileContents().translations;
const errors = resourceLoader.getFileContents().errors;

const EN = 'en';
const CY = 'cy';

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

describe('cica-postcode-verification > content', () => {
  const commonContent = generatePageContent({
    language: EN,
    userCase: {},
  }) as CommonContent;

  // eslint-disable-next-line jest/expect-expect
  test('should return correct english content', () => {
    languageAssertions(EN, enContent, () => generateContent(commonContent));
  });

  // eslint-disable-next-line jest/expect-expect
  test('should return correct welsh content', () => {
    languageAssertions(CY, cyContent, () => generateContent({ ...commonContent, language: CY }));
  });

  test('should include form configuration', () => {
    const result = generateContent(commonContent);
    expect(result.form).toBe(form);
  });
});

describe('cica-postcode-verification > validator', () => {
  const validator = (form.fields as FormFields).postcode.validator as (value: unknown) => unknown;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call postcode validator', () => {
    (isInvalidPostcode as jest.Mock).mockReturnValue('invalid');

    const result = validator('not-a-postcode');

    expect(result).toBe('invalid');
    expect(isInvalidPostcode).toHaveBeenCalledWith('not-a-postcode');
  });
});
