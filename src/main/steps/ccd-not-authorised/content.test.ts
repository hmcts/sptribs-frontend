import languageAssertions from '../../../test/unit/utils/languageAssertions';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';
import { CommonContent, generatePageContent } from '../common/common.content';

import { generateContent } from './content';

jest.mock('../../app/form/validation');

const TRANSLATION_FILE = 'ccd-not-authorised';

const resourceLoader = new ResourceReader();
resourceLoader.Loader(TRANSLATION_FILE);
const translations = resourceLoader.getFileContents().translations;

const EN = 'en';
const CY = 'cy';

const enContent = {
  ...translations.en,
};

const cyContent = {
  ...translations.cy,
};

describe('ccd not authorised > content', () => {
  const commonContent = generatePageContent({
    language: EN,
    userCase: { ccdReferenceNumber: '1234567890123456' },
  }) as CommonContent;

  test('should return correct english content', () => {
    languageAssertions(EN, enContent, () => generateContent(commonContent));
  });

  test('should return correct welsh content', () => {
    languageAssertions(CY, cyContent, () => generateContent({ ...commonContent, language: CY }));
  });

  test('should include ccd reference', () => {
    const result = generateContent(commonContent);
    expect(result.reference).toBe('1234567890123456');
  });
});
