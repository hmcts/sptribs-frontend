import { mockUserCase1 } from '../../../test/unit/utils/mockUserCase';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';
import { CommonContent } from '../common/common.content';

import { generateContent } from './content';

jest.mock('../../app/form/validation');

const DASHBOARD_TRANSLATION_FILE = 'dashboard';

const resourceLoader = new ResourceReader();
resourceLoader.Loader(DASHBOARD_TRANSLATION_FILE);
const translations = resourceLoader.getFileContents().translations;

const EN = 'en';
const CY = 'cy';

const en = {
  ...translations.en,
};

const cy = {
  ...translations.cy,
};

describe('dashboard', () => {
  const commonContent = { language: EN, userCase: mockUserCase1 } as CommonContent;

  let generatedContent;

  test('should return correct english content', () => {
    generatedContent = generateContent({ ...commonContent });
    expect(generatedContent.serviceName).toEqual(en.serviceName);
    expect(generatedContent.title).toEqual(en.title);
    expect(generatedContent.caseNumberLabel).toEqual(en.caseNumberLabel);
    expect(generatedContent.documentsHeading).toEqual(en.documentsHeading);
  });

  test('should return correct welsh content', () => {
    generatedContent = generateContent({ ...commonContent, language: CY });
    expect(generatedContent.serviceName).toEqual(cy.serviceName);
    expect(generatedContent.title).toEqual(cy.title);
    expect(generatedContent.caseNumberLabel).toEqual(cy.caseNumberLabel);
    expect(generatedContent.documentsHeading).toEqual(cy.documentsHeading);
  });
});
