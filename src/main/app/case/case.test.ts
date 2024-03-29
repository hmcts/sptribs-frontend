import { formatCase } from './case';

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
    const caseData: {
      representativeContactNumber: string;
      representativeEmailAddress: string;
      pcqId: string;
      applicantLastName: string;
      applicantAddress1: string;
      applicantEmailAddress: string;
      applicantHomeNumber: string;
      applicantAddressTown: string;
      subjectEmailAddress: string;
      representativeFullName: string;
      subjectContactNumber: string;
      caseTypeOfApplication: string;
      applicantFirstName: string;
      applicantDateOfBirth: { month: string; year: string; day: string };
      applicantAddressCountry: null;
      subjectDateOfBirth: { month: string; year: string; day: string };
      applicantAddressPostcode: null;
      subjectAgreeContact: string;
      subjectFullName: string;
      applicantStatementOfTruth: string;
      representativeOrganisationName: string;
      applicantAddress2: string;
      applicantPhoneNumber: string;
    } = {
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
      representativeFullName: '',
      representativeOrganisationName: '',
      representativeContactNumber: '',
      representativeEmailAddress: '',
      pcqId: '123456',
    };

    expect(caseData).toBeDefined();
  });
});
