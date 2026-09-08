import languageAssertions from '../../../test/unit/utils/languageAssertions';
import { FormFields } from '../../app/form/Form';
import {
  containsInvalidCharacters,
  isCCDReferenceNumberAcceptable,
  isFieldFilledIn,
  isMarkDownLinkIncluded,
} from '../../app/form/validation';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';
import { CommonContent, generatePageContent } from '../common/common.content';

import { form, generateContent } from './content';

jest.mock('../../app/form/validation');

const TRANSLATION_FILE = 'cica-lookup';

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

describe('cica lookup > content', () => {
  const commonContent = generatePageContent({
    language: EN,
    userCase: {},
  }) as CommonContent;

  test('should return correct english content', () => {
    languageAssertions(EN, enContent, () => generateContent(commonContent));
  });

  test('should return correct welsh content', () => {
    languageAssertions(CY, cyContent, () => generateContent({ ...commonContent, language: CY }));
  });

  test('should include form configuration', () => {
    const result = generateContent(commonContent);
    expect(result.form).toBe(form);
  });
});

describe('cica lookup > validator', () => {
  const validator = (form.fields as FormFields).ccdReference.validator as (value: unknown) => unknown;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return first validation error encountered', () => {
    (isFieldFilledIn as jest.Mock).mockReturnValue('REQUIRED_ERROR');
    (isMarkDownLinkIncluded as jest.Mock).mockReturnValue(undefined);
    (containsInvalidCharacters as jest.Mock).mockReturnValue(undefined);
    (isCCDReferenceNumberAcceptable as jest.Mock).mockReturnValue(undefined);

    const result = validator('');

    expect(result).toBe('REQUIRED_ERROR');
    expect(isFieldFilledIn).toHaveBeenCalled();
  });

  test('should fall through validators until one fails', () => {
    (isFieldFilledIn as jest.Mock).mockReturnValue(undefined);
    (isMarkDownLinkIncluded as jest.Mock).mockReturnValue(undefined);
    (containsInvalidCharacters as jest.Mock).mockReturnValue('INVALID_CHAR_ERROR');
    (isCCDReferenceNumberAcceptable as jest.Mock).mockReturnValue(undefined);

    const result = validator('bad-input');

    expect(result).toBe('INVALID_CHAR_ERROR');
    expect(containsInvalidCharacters).toHaveBeenCalled();
  });

  test('should call all validators if no errors', () => {
    (isFieldFilledIn as jest.Mock).mockReturnValue(undefined);
    (isMarkDownLinkIncluded as jest.Mock).mockReturnValue(undefined);
    (containsInvalidCharacters as jest.Mock).mockReturnValue(undefined);
    (isCCDReferenceNumberAcceptable as jest.Mock).mockReturnValue(undefined);

    const result = validator('1234567890123456');

    expect(result).toBeUndefined();
    expect(isCCDReferenceNumberAcceptable).toHaveBeenCalled();
  });
});
