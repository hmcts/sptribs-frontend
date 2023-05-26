import { mockUserCase1 } from '../../../../test/unit/utils/mockUserCase';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import { CommonContent } from '../../common/common.content';
import { generateContent } from '../application-submitted/content';

jest.mock('../../../app/form/validation');

const APPLICATION_SUBMITTED_TRANSLATION_FILE = 'application-submitted';

const resourceLoader = new ResourceReader();
resourceLoader.Loader(APPLICATION_SUBMITTED_TRANSLATION_FILE);
const translations = resourceLoader.getFileContents().translations;

const EN = 'en';
const CY = 'cy';

const en = {
  ...translations.en,
};

const cy = {
  ...translations.cy,
};

describe('application-submitted', () => {
  const commonContent = { language: EN, userCase: mockUserCase1 } as CommonContent;

  let generatedContent;

  test('should return correct english content', () => {
    generatedContent = generateContent({ ...commonContent });
    expect(generatedContent.serviceName).toEqual(en.serviceName);
    expect(generatedContent.title).toEqual(en.title);
    expect(generatedContent.line1).toEqual(en.line1);
    expect(generatedContent.line2).toEqual('An email will be sent to dummy@bob.com, that explains what happens next.');
    expect(generatedContent.line3).toEqual(en.line3);
    expect(generatedContent.line4).toEqual(en.line4);
  });

  test('should return correct welsh content', () => {
    generatedContent = generateContent({ ...commonContent, language: CY });
    expect(generatedContent.serviceName).toEqual(cy.serviceName);
    expect(generatedContent.title).toEqual(cy.title);
    expect(generatedContent.line1).toEqual(cy.line1);
    expect(generatedContent.line2).toEqual(
      'An email will be sent to dummy@bob.com, that explains what happens next. (in Welsh)'
    );
    expect(generatedContent.line3).toEqual(cy.line3);
    expect(generatedContent.line4).toEqual(cy.line4);
  });
});
