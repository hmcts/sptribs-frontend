import { AnyObject } from '../controller/PostController';

import type { CaseData, CaseworkerCICDocument, EditCicaCaseDetails, LanguagePreference, ListValue } from './definition';
import { YesOrNo } from './definition';

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
  newBundleOrderEnabled: YesOrNo;
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
  /** Must only be present if `representation` is `YesOrNo.YES` */
  representationQualified?: YesOrNo;
  /** Must only be present if `representation` is `YesOrNo.YES` */
  representativeFullName?: string;
  /** Must only be present if `representation` is `YesOrNo.YES` */
  representativeOrganisationName?: string;
  /** Must only be present if `representation` is `YesOrNo.YES` */
  representativeContactNumber?: string;
  /** Must only be present if `representation` is `YesOrNo.YES` */
  representativeEmailAddress?: string;
  cicaReferenceNumber: string;
  ccdReferenceNumber: string;
  editCicaCaseDetails: EditCicaCaseDetails;
  initialCicaDecisionDate: CaseDate;
  pcqId: string;
  documentRelevance: string;
  additionalInformation: string;
  tribunalFormDocuments: CaseDocument[];
  supportingDocuments: CaseDocument[];
  otherInfoDocuments: CaseDocument[];
  applicantDocuments: ListValue<CaseworkerCICDocument>[];
  languagePreference: LanguagePreference;
  /** Whether we've asked the user the equality questions yet. If true, we avoid asking again. */
  equalityAsked?: boolean;
}

export interface CaseWithId extends Case {
  id: string;
  state: any;
}

/**
 * Apply a page's form submission to the case. This mutates `userCase` in place.
 * <br>
 * This isn't quite as simple as `Object.assign`, because we need to ensure that some invariants are maintained.
 * For example, if the user has indicated that they do not have a representative, we need to ensure that all
 * representative fields are undefined.
 * @return The form data which must be sent off to apply these changes to the remote server. This is usually equal
 * to the `formData` argument, but may be different if we need to clear out some fields in other parts of the case.
 */
export const applyFormUpdatesToCase = (userCase: Partial<Case>, formData: Partial<Case>): Partial<Case> => {
  Object.assign(userCase, formData);
  const newFormData = { ...formData };

  if (userCase.representation === YesOrNo.NO) {
    // Representative is unset, so ensure that all representative fields are cleared.
    delete userCase.representationQualified;
    delete userCase.representativeFullName;
    delete userCase.representativeOrganisationName;
    delete userCase.representativeContactNumber;
    delete userCase.representativeEmailAddress;

    // And tell the form to explicitly clear out these fields on the remote server too.
    // Cast to `any` because our API types currently don't accept null as a valid value, even though null is
    // the correct way to clear out fields in CCD.
    newFormData.representationQualified = null as any;
    newFormData.representativeFullName = null as any;
    newFormData.representativeOrganisationName = null as any;
    newFormData.representativeContactNumber = null as any;
    newFormData.representativeEmailAddress = null as any;
  }

  return newFormData;
};

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

export interface CaseDocument {
  id: string;
  value: {
    documentLink: {
      document_url: string;
      document_filename: string;
      document_binary_url: string;
    };
    comment: string | null;
  };
}
