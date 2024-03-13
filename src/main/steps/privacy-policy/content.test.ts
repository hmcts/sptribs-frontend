import languageAssertions from '../../../test/unit/utils/languageAssertions';
import { CommonContent, generatePageContent } from '../common/common.content';

import { cy, en, generateContent } from './content';

jest.mock('../../app/form/validation');

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */
describe('privacy-policy > content', () => {
  const commonContent = generatePageContent({
    language: 'en',
    userCase: {},
  }) as CommonContent;

  test('should return correct english content', () => {
    languageAssertions('en', en, () => generateContent(commonContent));
  });

  test('should return correct welsh content', () => {
    languageAssertions('cy', cy, () => generateContent({ ...commonContent, language: 'cy' }));
  });
});
