import { Case, applyFormUpdatesToCase, formatCase } from './case';
import { LanguagePreference, YesOrNo } from './definition';

describe('formatCase', () => {
  it('formats case data using field formats', () => {
    const fields = {
      applicantFirstName: 'firstName',
      applicantLastName: 'lastName',
      applicantDateOfBirth: (data: any) => ({
        dateOfBirth: `${data.applicantDateOfBirth.day}/${data.applicantDateOfBirth.month}/${data.applicantDateOfBirth.year}`,
      }),
      applicantEmailAddress: 'email',
      applicantPhoneNumber: 'phone',
    };

    const data = {
      applicantFirstName: 'John',
      applicantLastName: 'Doe',
      applicantDateOfBirth: { year: '1990', month: '05', day: '15' },
      applicantEmailAddress: 'john@example.com',
      applicantPhoneNumber: '1234567890',
    };

    const formattedData = formatCase(fields, data);
    expect(formattedData).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '15/05/1990',
      email: 'john@example.com',
      phone: '1234567890',
    });
  });

  it('returns empty object when data is empty', () => {
    const fields = {
      applicantFirstName: 'firstName',
      applicantLastName: 'lastName',
    };

    const data = {};

    const formattedData = formatCase(fields, data);
    expect(formattedData).toEqual({});
  });
});

describe('Case interface', () => {
  it('defines the structure of a case', () => {
    const caseData: Case = {
      newBundleOrderEnabled: YesOrNo.YES,
      namedApplicant: YesOrNo.YES,
      caseTypeOfApplication: 'Type A',
      applicantFirstName: 'John',
      applicantLastName: 'Doe',
      applicantDateOfBirth: { year: '1990', month: '05', day: '15' },
      applicantEmailAddress: 'john@example.com',
      applicantPhoneNumber: '1234567890',
      applicantHomeNumber: '',
      applicantAddress1: '123 Main Street',
      applicantAddress2: '',
      applicantAddressTown: 'Cityville',
      applicantAddressCountry: null,
      applicantAddressPostcode: null,
      applicantStatementOfTruth: 'I declare...',
      subjectFullName: 'Jane Smith',
      subjectDateOfBirth: { year: '1985', month: '10', day: '25' },
      subjectEmailAddress: 'jane@example.com',
      subjectContactNumber: '9876543210',
      subjectAgreeContact: 'yes',
      representation: YesOrNo.YES,
      representationQualified: YesOrNo.YES,
      representativeFullName: '',
      representativeOrganisationName: '',
      representativeContactNumber: '',
      representativeEmailAddress: '',
      pcqId: '123456',
      ccdReferenceNumber: '1234567891234567',
      cicaReferenceNumber: 'testCicaRef123',
      editCicaCaseDetails: {
        cicaReferenceNumber: 'testCicaRef123',
      },
      initialCicaDecisionDate: { year: '2020', month: '01', day: '30' },
      documentRelevance: 'doc relevance',
      additionalInformation: 'some info',
      tribunalFormDocuments: [],
      supportingDocuments: [],
      otherInfoDocuments: [],
      applicantDocuments: [],
      languagePreference: LanguagePreference.ENGLISH,
    };

    expect(caseData).toBeDefined();
  });
});

describe('applyFormUpdatesToCase', () => {
  test.each([
    {
      note: 'clears representative fields and sends nulls when representation becomes NO',
      initialUserCase: {
        representation: YesOrNo.YES,
        representationQualified: YesOrNo.YES,
        representativeFullName: 'Rep Name',
        representativeOrganisationName: 'Rep Org',
        representativeContactNumber: '07123456789',
        representativeEmailAddress: 'rep@example.com',
      } as Partial<Case>,
      formData: { representation: YesOrNo.NO } as Partial<Case>,
      expectedUserCase: {
        representation: YesOrNo.NO,
      },
      expectedPayload: {
        representation: YesOrNo.NO,
        representationQualified: null,
        representativeFullName: null,
        representativeOrganisationName: null,
        representativeContactNumber: null,
        representativeEmailAddress: null,
      },
    },
    {
      note: 'does not clear representative fields when representation is YES',
      initialUserCase: {
        representation: YesOrNo.YES,
        representativeFullName: 'Rep Name',
        representativeOrganisationName: 'Rep Org',
      } as Partial<Case>,
      formData: { subjectFullName: 'New Subject' } as Partial<Case>,
      expectedUserCase: {
        representation: YesOrNo.YES,
        representativeFullName: 'Rep Name',
        representativeOrganisationName: 'Rep Org',
        subjectFullName: 'New Subject',
      },
      expectedPayload: {
        subjectFullName: 'New Subject',
      },
    },
    {
      note: 'still clears representative fields when case already has representation NO',
      initialUserCase: {
        representation: YesOrNo.NO,
        representationQualified: YesOrNo.YES,
        representativeFullName: 'Stale Rep',
      } as Partial<Case>,
      formData: { subjectContactNumber: '07000000000' } as Partial<Case>,
      expectedUserCase: {
        representation: YesOrNo.NO,
        subjectContactNumber: '07000000000',
      },
      expectedPayload: {
        subjectContactNumber: '07000000000',
        representationQualified: null,
        representativeFullName: null,
        representativeOrganisationName: null,
        representativeContactNumber: null,
        representativeEmailAddress: null,
      },
    },
  ])('$note', ({ initialUserCase, formData, expectedUserCase, expectedPayload }) => {
    const userCase = { ...initialUserCase };

    const result = applyFormUpdatesToCase(userCase, formData);

    expect(userCase).toEqual(expectedUserCase);
    expect(result).toEqual(expectedPayload);
  });
});
