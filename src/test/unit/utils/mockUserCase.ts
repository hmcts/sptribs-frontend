import { YesOrNo } from '../../../main/app/case/definition';

export const mockUserCase1 = {
  id: '',
  state: 'FIS',
  namedApplicant: true,
  saveAndContinue: 'true',
  subjectFullName: 'Joe Bob',
  subjectDateOfBirth: { year: '1829', month: '12', day: '27' },
  subjectEmailAddress: 'dummy@bob.com',
  subjectContactNumber: '012345678910',
  subjectAgreeContact: 'Yes',
  representation: YesOrNo.YES,
  representationQualified: YesOrNo.YES,
  representativeFullName: 'rep rep',
  representativeOrganisationName: 'rep org',
  representativeContactNumber: '012345678910',
  representativeEmailAddress: 'rep@dummy.com',
} as unknown as any;

export const mockUserCase2 = {
  id: '',
  state: 'FIS',
  namedApplicant: true,
  saveAndContinue: 'true',
  applicantDateOfBirth: { year: '1829', month: '12', day: '27' },
  applicantAddressPostcode: 'G11 XXL',
  applicantSelectAddress: '10',
  applicantAddress1: '100 Dummy Avenue',
  applicantAddress2: '',
  applicantAddressTown: 'DummyCity',
  applicantAddressCounty: 'CITY OF Dummy',
  contactPreferenceType: 'NAMED_PERSON',
  emailAddress: 'dummy@bob.com',
  homePhoneNumber: '012345678910',
  mobilePhoneNumber: '012345678910',
  applicantFirstNames: 'Foe',
  applicantLastNames: 'Bob',
} as unknown as any;

export const mockUserCase3 = {
  id: '',
  state: 'FIS',
  namedApplicant: true,
  saveAndContinue: 'true',
  applicantDateOfBirth: { year: '1829', month: '12', day: '27' },
  applicantAddressPostcode: 'G11 XXL',
  applicantSelectAddress: '10',
  applicantAddress1: '100 Dummy Avenue',
  applicantAddress2: '',
  applicantAddressTown: 'DummyCity',
  applicantAddressCounty: 'CITY OF Dummy',
  contactPreferenceType: 'BOTH_RECEIVE',
  emailAddress: 'dummy@bob.com',
  homePhoneNumber: '012345678910',
  mobilePhoneNumber: '012345678910',
  applicantFirstNames: 'Foe',
  applicantLastNames: 'Bob',
} as unknown as any;

export const mockUserCase4 = {
  caseTypeOfApplication: 'CIC',
  subjectFullName: 'Joe Bob',
  subjectDateOfBirth: { year: '1829', month: '12', day: '27' },
  subjectEmailAddress: 'dummy@bob.com',
  subjectContactNumber: '012345678910',
  subjectAgreeContact: 'Yes',
  representation: YesOrNo.YES,
  representationQualified: YesOrNo.YES,
  representativeFullName: 'rep org',
  representativeOrganisationName: 'rep org',
  representativeContactNumber: '012345678910',
  representativeEmailAddress: 'dummy@bob.com',
  pcqId: undefined,
  additionalInformation: undefined,
} as unknown as any;

export const mockUserCase4Output = {
  CaseTypeOfApplication: 'CIC',
  SubjectFullName: 'Joe Bob',
  SubjectDateOfBirth: '1829-12-27',
  SubjectEmailAddress: 'dummy@bob.com',
  SubjectContactNumber: '012345678910',
  SubjectAgreeContact: 'Yes',
  Representation: YesOrNo.YES,
  RepresentationQualified: YesOrNo.YES,
  RepresentativeFullName: 'rep org',
  RepresentativeOrganisationName: 'rep org',
  RepresentativeContactNumber: '012345678910',
  RepresentativeEmailAddress: 'dummy@bob.com',
  PcqId: undefined,
  AdditionalInformation: undefined,
} as unknown as any;

export const mockAdditionalDocument = {
  id: '1',
} as unknown as any;

export const mockUploadDocument = {
  id: '1',
} as unknown as any;
