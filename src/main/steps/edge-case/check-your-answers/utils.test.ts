import { mockUserCase1, mockUserCase2, mockUserCase3 } from '../../../../test/unit/utils/mockUserCase';

import { enContent } from './content';
import {
  OtherInformationSummary, RepresentationSummary,
  SubjectSummaryList,
  SupportingDocumentsSummary,
  UploadAppealFormSummary,
} from './utils';
/**AdditonalFormSummary UploadFormSummary   */

describe('upload-addition-documents > check-your-answers', () => {
  describe('applicationSummaryList', () => {
    test.each([
      {
        userCase: mockUserCase1,
        expected: {
          rows: [
            {
              actions: {
                items: [
                  {
                    href: '/full-name',
                    text: 'change',
                    visuallyHiddenText: 'Subject’s name',
                  },
                ],
              },
              key: { text: 'Subject’s name' },
              value: { text: 'FirstName LastName' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/date-of-birth',
                    text: 'change',
                    visuallyHiddenText: 'Subject’s DoB',
                  },
                ],
              },
              key: { text: 'Subject’s DoB' },
              value: { text: '27 December 1829' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/address/manual',
                    text: 'change',
                    visuallyHiddenText: 'Address',
                  },
                ],
              },
              key: { text: 'Address' },
              value: { html: '100 Dummy Avenue<br>DummyCity<br>CITY OF Dummy<br>G11 XXL' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/contact-preferences',
                    text: 'change',
                    visuallyHiddenText: 'Who should receive emails about the application',
                  },
                ],
              },
              key: { text: 'Who should receive emails about the application' },
              value: { text: 'The account owner' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/subject-contact-details',
                    text: 'change',
                    visuallyHiddenText: 'Email address of the person named on the application',
                  },
                ],
              },
              key: { text: 'Email address of the person named on the application' },
              value: { text: 'dummy@bob.com' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/contact-details',
                    text: 'change',
                    visuallyHiddenText: 'Contact number of the person named on the application',
                  },
                ],
              },
              key: { text: 'Contact number of the person named on the application' },
              value: { text: '012345678910' },
            },
          ],
          title: 'Applicant details',
        },
      },
    ])('return correct summary list items when %#', ({ userCase, expected }) => {
      expect(SubjectSummaryList(enContent, userCase)).not.toBe(expected);
    });
  });
});

describe('upload-addition-documents > named owner > check-your-answers', () => {
  describe('applicationSummaryList', () => {
    test.each([
      {
        userCase: mockUserCase2,
        expected: {
          rows: [
            {
              actions: {
                items: [
                  {
                    href: '/full-name',
                    text: 'change',
                    visuallyHiddenText: 'Subject’s name',
                  },
                ],
              },
              key: { text: 'Subject’s name' },
              value: { text: 'FirstName LastName' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/date-of-birth',
                    text: 'change',
                    visuallyHiddenText: 'Subject’s DoB',
                  },
                ],
              },
              key: { text: 'Subject’s DoB' },
              value: { text: '27 December 1829' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/address/manual',
                    text: 'change',
                    visuallyHiddenText: 'Address',
                  },
                ],
              },
              key: { text: 'Address' },
              value: { html: '100 Dummy Avenue<br>DummyCity<br>CITY OF Dummy<br>G11 XXL' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/contact-preferences',
                    text: 'change',
                    visuallyHiddenText: 'Who should receive emails about the application',
                  },
                ],
              },
              key: { text: 'Who should receive emails about the application' },
              value: { text: 'The account owner' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/subject-contact-details',
                    text: 'change',
                    visuallyHiddenText: 'Email address of the person named on the application',
                  },
                ],
              },
              key: { text: 'Email address of the person named on the application' },
              value: { text: 'dummy@bob.com' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/contact-details',
                    text: 'change',
                    visuallyHiddenText: 'Contact number of the person named on the application',
                  },
                ],
              },
              key: { text: 'Contact number of the person named on the application' },
              value: { text: '012345678910' },
            },
          ],
          title: 'Applicant details',
        },
      },
    ])('return correct summary list items when %#', ({ userCase, expected }) => {
      expect(SubjectSummaryList(enContent, userCase)).not.toBe(expected);
    });
  });
});

describe('upload-addition-documents > named owner and both > named owner > check-your-answers', () => {
  describe('applicationSummaryList', () => {
    test.each([
      {
        userCase: mockUserCase3,
        expected: {
          rows: [
            {
              actions: {
                items: [
                  {
                    href: '/full-name',
                    text: 'change',
                    visuallyHiddenText: 'Subject’s name',
                  },
                ],
              },
              key: { text: 'Subject’s name' },
              value: { text: 'FirstName LastName' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/date-of-birth',
                    text: 'change',
                    visuallyHiddenText: 'Subject’s DoB',
                  },
                ],
              },
              key: { text: 'Subject’s DoB' },
              value: { text: '27 December 1829' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/address/manual',
                    text: 'change',
                    visuallyHiddenText: 'Address',
                  },
                ],
              },
              key: { text: 'Address' },
              value: { html: '100 Dummy Avenue<br>DummyCity<br>CITY OF Dummy<br>G11 XXL' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/contact-preferences',
                    text: 'change',
                    visuallyHiddenText: 'Who should receive emails about the application',
                  },
                ],
              },
              key: { text: 'Who should receive emails about the application' },
              value: { text: 'The account owner' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/subject-contact-details',
                    text: 'change',
                    visuallyHiddenText: 'Email address of the person named on the application',
                  },
                ],
              },
              key: { text: 'Email address of the person named on the application' },
              value: { text: 'dummy@bob.com' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/contact-details',
                    text: 'change',
                    visuallyHiddenText: 'Contact number of the person named on the application',
                  },
                ],
              },
              key: { text: 'Contact number of the person named on the application' },
              value: { text: '012345678910' },
            },
            {
              actions: {
                items: [
                  {
                    href: '/contact-details',
                    text: 'change',
                    visuallyHiddenText: 'Contact number of the person named on the application',
                  },
                ],
              },
              key: { text: 'Contact number of the person named on the application' },
              value: { text: '012345678910' },
            },
          ],
          title: 'Applicant details',
        },
      },
    ])('return correct summary list items when %#', ({ userCase, expected }) => {
      expect(SubjectSummaryList(enContent, userCase)).not.toBe(expected);
    });
  });
});

describe('Additional Form Summary > check-your-answers', () => {
  describe('applicationSummaryList', () => {
    test.each([
      {
        userCase: [{ fileName: 'a.txt' }, { fileName: 'b.txt' }],
        expected: {
          rows: [
            {
              actions: {
                items: [
                  {
                    href: '/full-name',
                    text: 'change',
                    visuallyHiddenText: 'Subject’s name',
                  },
                ],
              },
              key: { text: 'Subject’s name' },
              value: { text: 'FirstName LastName' },
            },
          ],
          title: 'Applicant details',
        },
      },
    ])('return correct summary list items when %#', ({ userCase, expected }) => {
      expect(SupportingDocumentsSummary(enContent, userCase)).not.toBe(expected);
    });
  });
});

describe('Other information > check-your-answers', () => {
  describe('OtherInformationSummary', () => {
    test.each([
      {
        otherDocument: [{ fileName: 'a.txt' }, { fileName: 'b.txt' }],
        userCase: mockUserCase3,
        expected: {
          rows: [
            {
              actions: {
                items: [
                  {
                    href: '/full-name',
                    text: 'change',
                    visuallyHiddenText: 'Subject’s name',
                  },
                ],
              },
              key: { text: 'Subject’s name' },
              value: { text: 'FirstName LastName' },
            },
          ],
          title: 'Applicant details',
        },
      },
    ])('return correct summary list items when %#', ({ otherDocument, userCase, expected }) => {
      expect(OtherInformationSummary(enContent, otherDocument, userCase)).not.toBe(expected);
    });
  });
});

describe('Form Summary > check-your-answers', () => {
  describe('applicationSummaryList', () => {
    test.each([
      {
        userCase: [{ fileName: 'a.txt' }, { fileName: 'b.txt' }],
        expected: {
          rows: [
            {
              actions: {
                items: [
                  {
                    href: '/full-name',
                    text: 'change',
                    visuallyHiddenText: 'Subject’s name',
                  },
                ],
              },
              key: { text: 'Subject’s name' },
              value: { text: 'FirstName LastName' },
            },
          ],
          title: 'Applicant details',
        },
      },
    ])('return correct summary list items when %#', ({ userCase, expected }) => {
      expect(UploadAppealFormSummary(enContent, userCase)).not.toBe(expected);
    });
  });
});

describe('Other information > check-your-answers no documents', () => {
  describe('OtherInformationSummary', () => {
    test.each([
      {
        documents: [],
        userCase: mockUserCase3,
        expected: {
          rows: [
            {
              actions: {
                items: [
                  {
                    href: '/full-name',
                    text: 'change',
                    visuallyHiddenText: 'Subject’s name',
                  },
                ],
              },
              key: { text: 'Subject’s name' },
              value: { text: 'FirstName LastName' },
            },
          ],
          title: 'Applicant details',
        },
      },
    ])('return correct summary list items when %#', ({ documents, userCase, expected }) => {
      expect(OtherInformationSummary(enContent, documents, userCase)).not.toBe(expected);
    });
  });
});

describe('Representation Summary > check-your-answers', () => {
  describe('RepresentationSummary Yes Radio Button', () => {
    test.each([
      {
        documents: [],
        userCase: {
          ...mockUserCase3,
          representation: 'Yes',
          representationQualified: 'Yes'
        },
        expected: {
          rows: [
            {
              actions: {
                items: [
                  {
                    href: '/representation',
                    text: 'change',
                    visuallyHiddenText: 'Is there a representative named on completed tribunal form?'
                  }
                ]
              },
              key: { text: 'Is there a representative named on completed tribunal form?' },
              value: { text: 'Yes' }
            },
            {
              actions: {
                items: [
                  {
                    href: '/representation-qualified',
                    text: 'change',
                    visuallyHiddenText: 'Is the named representative legally qualified?'
                  }
                ]
              },
              key: { text: 'Is the named representative legally qualified?' },
              value: { text: 'Yes' }
            }
          ],
          title: 'Representation'
        },
      },
    ])('return correct summary list items when %#', ({ userCase, expected }) => {
      expect(RepresentationSummary(enContent, userCase)).toStrictEqual(expected);
    });
  });

  describe('RepresentationSummary No Radio Button', () => {
    test.each([
      {
        documents: [],
        userCase: {
          ...mockUserCase3,
          representation: 'No',
          representationQualified: 'No'
        },
        expected: {
          rows: [
            {
              actions: {
                items: [
                  {
                    href: '/representation',
                    text: 'change',
                    visuallyHiddenText: 'Is there a representative named on completed tribunal form?'
                  }
                ]
              },
              key: { text: 'Is there a representative named on completed tribunal form?' },
              value: { text: 'No' }
            }
          ],
          title: 'Representation'
        },
      },
    ])('return correct summary list items when %#', ({ userCase, expected }) => {
      expect(RepresentationSummary(enContent, userCase)).toStrictEqual(expected);
    });
  });
});
