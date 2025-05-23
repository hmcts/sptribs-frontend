import { AnyObject } from '../controller/PostController';

import type { CaseData, LanguagePreference, YesOrNo } from './definition';

export const formFieldsToCaseMapping: Partial<Record<keyof Case, keyof CaseData>> = {
  caseTypeOfApplication: 'dssCaseDataCaseTypeOfApplication',
  applicantDateOfBirth: 'cicCaseApplicantDateOfBirth',
  applicantEmailAddress: 'cicCaseApplicantEmailAddress',
  applicantPhoneNumber: 'cicCaseApplicantPhoneNumber',
  tribunalFormDocuments: 'dssCaseDataTribunalFormDocuments',
  supportingDocuments: 'dssCaseDataSupportingDocuments',
  otherInfoDocuments: 'dssCaseDataOtherInfoDocuments',
  subjectFullName: 'dssCaseDataSubjectFullName',
  subjectEmailAddress: 'dssCaseDataSubjectEmailAddress',
  subjectContactNumber: 'dssCaseDataSubjectContactNumber',
  subjectAgreeContact: 'dssCaseDataSubjectAgreeContact',
  representation: 'dssCaseDataRepresentation',
  representationQualified: 'dssCaseDataRepresentationQualified',
  representativeFullName: 'dssCaseDataRepresentativeFullName',
  representativeOrganisationName: 'dssCaseDataRepresentativeOrganisationName',
  representativeContactNumber: 'dssCaseDataRepresentativeContactNumber',
  representativeEmailAddress: 'dssCaseDataRepresentativeEmailAddress',
  pcqId: 'dssCaseDataPcqId',
  additionalInformation: 'dssCaseDataAdditionalInformation',
  languagePreference: 'dssCaseDataLanguagePreference',
};

export function formatCase<InputFormat, OutputFormat>(fields: FieldFormats, data: InputFormat): OutputFormat {
  const result = {};
  for (const field of Object.keys(data as any)) {
    const value = fields[field];

    if (typeof value === 'function') {
      Object.assign(result, value(data));
    } else if (typeof fields[field] === 'string') {
      result[value] = data[field];
    }
  }
  return result as OutputFormat;
}

export type FieldFormats = Record<string, string | ((AnyObject) => AnyObject)>;

export interface Case {
  namedApplicant: YesOrNo;
  caseTypeOfApplication: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantDateOfBirth: CaseDate;
  applicantEmailAddress: string;
  applicantPhoneNumber: string;
  applicantHomeNumber: string;
  applicantAddress1: string;
  applicantAddress2: string;
  applicantAddressTown: string;
  applicantAddressCountry: any;
  applicantAddressPostcode: any;
  applicantStatementOfTruth: string;
  subjectFullName: string;
  subjectDateOfBirth: CaseDate;
  subjectEmailAddress: string;
  subjectContactNumber: string;
  subjectAgreeContact: string;
  representation: YesOrNo;
  representationQualified: YesOrNo;
  representativeFullName: string;
  representativeOrganisationName: string;
  representativeContactNumber: string;
  representativeEmailAddress: string;
  pcqId: string;
  documentRelevance: string;
  additionalInformation: string;
  tribunalFormDocuments: Document[];
  supportingDocuments: Document[];
  otherInfoDocuments: Document[];
  languagePreference: LanguagePreference;
}

export interface CaseWithId extends Case {
  id: string;
  state: any;
}

export enum Checkbox {
  Checked = 'checked',
  Unchecked = '',
}

export interface CaseDate {
  year: string;
  month: string;
  day: string;
}

export interface UploadedFile {
  id: string;
  name: string;
}

export interface DocumentUpload {
  url: string;
  fileName: string;
  documentId: string;
  binaryUrl: string;
  description: string;
}

export enum FieldPrefix {
  APPLICANT = 'applicant',
}
