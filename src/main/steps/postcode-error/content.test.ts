import languageAssertions from '../../../test/unit/utils/languageAssertions';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';
import { CommonContent, generatePageContent } from '../common/common.content';

import { generateContent } from './content';

jest.mock('../../app/form/validation');

const TRANSLATION_FILE = 'postcode-error';

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

describe('postcode error > content', () => {
  const commonContent = generatePageContent({
    language: EN,
  }) as CommonContent;

  test('should return correct english content', () => {
    languageAssertions(EN, enContent, () => generateContent(commonContent));
    expect(generateContent(commonContent)).toEqual(expect.objectContaining(enContent));
  });

  test('should return correct welsh content', () => {
    languageAssertions(CY, cyContent, () => generateContent({ ...commonContent, language: CY }));
    expect(generateContent({ ...commonContent, language: CY })).toEqual(expect.objectContaining(cyContent));
  });
});
