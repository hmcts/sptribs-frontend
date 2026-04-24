import languageAssertions from '../../../test/unit/utils/languageAssertions';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';
import { CommonContent, generatePageContent } from '../common/common.content';

import { form, generateContent } from './content';

jest.mock('../../app/form/validation');

const TRANSLATION_FILE = 'cica-confirm-new';

const resourceLoader = new ResourceReader();
resourceLoader.Loader(TRANSLATION_FILE);

const translations = resourceLoader.getFileContents().translations;
const errors = resourceLoader.getFileContents().errors;

const EN = 'en';
const CY = 'cy';

const ccdReference = '1234567890123456';

const enContent = {
  ...translations.en,
  line1: `${translations.en.line1Part1}${ccdReference}${translations.en.line1Part2}`,
  errors: {
    ...errors.en,
  },
};

const cyContent = {
  ...translations.cy,
  line1: `${translations.cy.line1Part1}${ccdReference}${translations.cy.line1Part2}`,
  errors: {
    ...errors.cy,
  },
};

describe('cica confirm new > content', () => {
  const commonContent = generatePageContent({
    language: EN,
    userCase: { ccdReferenceNumber: ccdReference },
  }) as CommonContent;

  test('should return correct english content', () => {
    languageAssertions(EN, enContent, () => generateContent(commonContent));
  });

  test('should return correct welsh content', () => {
    languageAssertions(CY, cyContent, () => generateContent({ ...commonContent, language: CY }));
  });

  test('should include interpolated ccd reference in line1', () => {
    const result = generateContent(commonContent);

    expect(result.line1).toContain(ccdReference);
  });

  test('should include form configuration', () => {
    const result = generateContent(commonContent);

    expect(result.form).toBe(form);
  });

  test('should default ccd reference to empty string when missing', () => {
    const result = generateContent({
      ...commonContent,
      userCase: {},
    } as CommonContent);

    expect(result.line1).toBe(`${translations.en.line1Part1}${''}${translations.en.line1Part2}`);
  });
});
