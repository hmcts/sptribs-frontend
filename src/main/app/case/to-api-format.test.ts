const v4Mock = jest.fn().mockReturnValue('MOCK_V4_UUID');
jest.mock('uuid', () => ({
  v4: v4Mock,
}));

import { Case } from './case';
import { toApiDate, toApiFormat } from './to-api-format';

describe('to-api-format', () => {
  test('handles invalid data correctly', async () => {
    const apiFormat = toApiFormat({
      applicant1HelpWithFeesRefNo: '123-ABC',
    } as Partial<Case>);

    expect(apiFormat).not.toMatchObject({
      applicant1HWFReferenceNumber: '123-ABC',
    });
  });
});

test('should convert date of birth format to backend api format', async () => {
  const dateFormat = toApiDate({ day: '20', month: '1', year: '2000' });
  expect(dateFormat).toMatch('2000-01-20');
});

test('if date is null then check for empty value', async () => {
  const dateFormat = toApiDate({ day: '', month: '1', year: '2000' });
  expect(dateFormat).toMatch('');
});

test('if editCicaCaseDetails.cicaReferenceNumber is null then toApiFormat should still return empty editCicaCaseDetails.cicaReferenceNumber value', async () => {
  const editCicaCaseDetailsFormat = toApiFormat({
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
    cicaReferenceNumber: 'testCicaRef123',
    editCicaCaseDetails: {
      cicaReferenceNumber: '',
      cicaCaseWorker: '',
      cicaCasePresentingOfficer: '',
    },
  });
  expect(editCicaCaseDetailsFormat.editCicaCaseDetails.cicaReferenceNumber).toMatch('');
});

test('if editCicaCaseDetails.cicaReferenceNumber is not null then toApiFormat should return editCicaCaseDetails.cicaReferenceNumber', async () => {
  const editCicaCaseDetailsFormat = toApiFormat({
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
    cicaReferenceNumber: 'testCicaRef123',
    editCicaCaseDetails: {
      cicaReferenceNumber: 'testCicaRef123',
      cicaCaseWorker: '',
      cicaCasePresentingOfficer: '',
    },
  });
  expect(editCicaCaseDetailsFormat.editCicaCaseDetails.cicaReferenceNumber).toMatch('testCicaRef123');
});
