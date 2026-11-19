import { generatePageContent } from './common.content';

describe('generatePageContent', () => {
  test('does not set hasFieldPageHeading when pageContent is not provided', () => {
    const content = generatePageContent({ language: 'en' });

    expect(content.hasFieldPageHeading).toBeUndefined();
  });

  test('does not set hasFieldPageHeading when form is missing', () => {
    const content = generatePageContent({
      language: 'en',
      pageContent: () => ({ title: 'Some page' }),
    });

    expect(content.hasFieldPageHeading).toBeUndefined();
  });

  test('does not set hasFieldPageHeading when form fields exist but none isPageHeading', () => {
    const content = generatePageContent({
      language: 'en',
      pageContent: () => ({
        form: {
          fields: {
            subjectFullName: {
              type: 'text',
              isPageHeading: false,
            },
            subjectDateOfBirth: {
              type: 'date',
              values: [{ name: 'day' }, { name: 'month' }, { name: 'year' }],
              isPageHeading: undefined,
            },
            subjectFavouriteColor: {
              type: 'text',
            },
          },
        },
      }),
    });

    expect(content.hasFieldPageHeading).toBeUndefined();
  });

  test('sets hasFieldPageHeading when at least one field has isPageHeading=true', () => {
    const content = generatePageContent({
      language: 'en',
      pageContent: () => ({
        form: {
          fields: {
            namedApplicant: {
              type: 'radios',
              isPageHeading: true,
              values: [
                { label: 'Yes', value: 'YES' },
                { label: 'No', value: 'NO' },
              ],
            },
          },
        },
      }),
    });

    expect(content.hasFieldPageHeading).toBe(true);
  });
});
