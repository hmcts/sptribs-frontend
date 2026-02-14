/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2025-05-16 13:51:40.

export interface Address {
  AddressLine1: string;
  AddressLine2: string;
  AddressLine3: string;
  PostTown: string;
  County: string;
  PostCode: string;
  Country: string;
}

export interface AddressGlobal extends Address {}

export interface AddressGlobalUK extends Address {}

export interface AddressUK extends Address {}

export interface BulkScanEnvelope {
  id: string;
  action: string;
}

export interface CaseLink {
  CaseReference: string;
  ReasonForLink: ListValue<LinkReason>[];
  CreatedDateTime: DateAsString;
  CaseType: string;
}

export interface CaseLocation {
  Region: string;
  BaseLocation: string;
}

export interface ChangeOrganisationRequest<R> {
  OrganisationToAdd: Organisation;
  OrganisationToRemove: Organisation;
  CaseRoleId: R;
  Reason: string;
  NotesReason: string;
  ApprovalStatus: ChangeOrganisationApprovalStatus;
  RequestTimestamp: DateAsString;
  ApprovalRejectionTimestamp: DateAsString;
  CreatedBy: string;
}

export interface ComponentLauncher {}

export interface DynamicElementIndicator {}

export interface DynamicList {
  value: DynamicListElement;
  list_items: DynamicListElement[];
  valueLabel: string;
  valueCode: string;
}

export interface DynamicListElement {
  code: string;
  label: string;
}

export interface DynamicListItem {
  code: string;
  label: string;
}

export interface DynamicMultiSelectList {
  value: DynamicListElement[];
  list_items: DynamicListElement[];
}

export interface ExceptionRecord {
  envelopeLabel: string;
  journeyClassification: string;
  poBox: string;
  poBoxJurisdiction: string;
  deliveryDate: DateAsString;
  openingDate: DateAsString;
  scannedDocuments: ListValue<ExceptionRecordScannedDocument>[];
  scanOCRData: ListValue<KeyValue>[];
  attachToCaseReference: string;
  caseReference: string;
  ocrDataValidationWarnings: string[];
  displayWarnings: YesOrNo;
  formType: string;
  envelopeId: string;
  awaitingPaymentDCNProcessing: YesOrNo;
  containsPayments: YesOrNo;
  envelopeCaseReference: string;
  envelopeLegacyCaseReference: string;
  showEnvelopeCaseReference: YesOrNo;
  showEnvelopeLegacyCaseReference: YesOrNo;
  surname: string;
  searchCaseReference: string;
}

export interface ExceptionRecordScannedDocument {
  recordMetaData: string;
  type: ScannedDocumentType;
  subtype: string;
  url: any;
  controlNumber: string;
  fileName: string;
  scannedDate: DateAsString;
  deliveryDate: DateAsString;
}

export interface Fee {
  FeeAmount: string;
  FeeCode: string;
  FeeDescription: string;
  FeeVersion: string;
}

export interface FlagDetail {
  name: string;
  name_cy: string;
  subTypeValue: string;
  subTypeValue_cy: string;
  subTypeKey: string;
  otherDescription: string;
  otherDescription_cy: string;
  flagComment: string;
  flagComment_cy: string;
  flagUpdateComment: string;
  dateTimeModified: DateAsString;
  dateTimeCreated: DateAsString;
  path: ListValue<string>[];
  hearingRelevant: YesOrNo;
  flagCode: string;
  status: string;
  availableExternally: YesOrNo;
}

export interface FlagLauncher {}

export interface Flags {
  partyName: string;
  roleOnCase: string;
  details: ListValue<FlagDetail>[];
  visibility: FlagVisibility;
  groupId: string;
}

export interface KeyValue {
  key: string;
  value: string;
}

export interface LinkReason {
  Reason: string;
  OtherDescription: string;
}

export interface ListValue<T> {
  id: string;
  value: T;
}

export interface OrderSummary {
  PaymentReference: string;
  Fees: ListValue<Fee>[];
  PaymentTotal: string;
}

export interface Organisation {
  OrganisationName: string;
  OrganisationID: string;
  OrganisationId: string;
}

export interface OrganisationPolicy<R> {
  Organisation: Organisation;
  PreviousOrganisations: PreviousOrganisationCollectionItem[];
  OrgPolicyReference: string;
  PrepopulateToUsersOrganisation: YesOrNo;
  OrgPolicyCaseAssignedRole: R;
}

export interface PreviousOrganisation {
  FromTimestamp: DateAsString;
  ToTimestamp: DateAsString;
  OrganisationName: string;
  OrganisationAddress: AddressUK;
}

export interface PreviousOrganisationCollectionItem {
  id: string;
  value: PreviousOrganisation;
}

export interface ScannedDocument {
  type: ScannedDocumentType;
  subtype: string;
  url: any;
  controlNumber: string;
  fileName: string;
  scannedDate: DateAsString;
  deliveryDate: DateAsString;
  exceptionRecordReference: string;
}

export interface SearchCriteria {
  OtherCaseReferences: ListValue<string>[];
  SearchParties: ListValue<SearchParty>[];
}

export interface SearchParty {
  CollectionFieldName: string;
  Name: string;
  EmailAddress: string;
  AddressLine1: string;
  DOB: DateAsString;
  DOD: DateAsString;
  PostCode: string;
  Postcode: string;
}

export interface TTL {
  SystemTTL: DateAsString;
  Suspended: YesOrNo;
  OverrideTTL: DateAsString;
}

export interface WaysToPay {}

export interface CaseBuilt {}

export interface CaseFlagDisplay {
  name: string;
  flagType: string;
  comments: string;
  creationDate: DateAsString;
  lastModified: DateAsString;
  status: string;
}

export interface CaseIssue {
  DocumentList: DynamicMultiSelectList;
}

export interface CaseIssueDecision {
  DecisionNotice: NoticeOption;
  IssueDecisionTemplate: DecisionTemplate;
  IssueDecisionDraft: any;
  DecisionDocument: CICDocument;
}

export interface CaseIssueFinalDecision {
  FinalDecisionNotice: NoticeOption;
  DecisionTemplate: DecisionTemplate;
  FinalDecisionDraft: any;
  FinalDecisionGuidance: any;
  Document: CICDocument;
}

export interface CaseLinks {
  CaseReference: CaseLink;
  Reason: string;
  OtherDescription: string;
  CreatedDateTime: DateTime;
  CaseType: string;
}

export interface CaseLinksElement<T> {
  id: string;
  value: T;
}

export interface CaseManagementLocation {
  baseLocation: string;
  region: string;
}

export interface CaseNote {
  author: string;
  date: DateAsString;
  note: string;
}

export interface CaseStay {
  StayReason: StayReason;
  AdditionalDetail: string;
  ExpirationDate: DateAsString;
  FlagType: string;
  IsCaseStayed: YesOrNo;
}

export interface CloseCase {
  CloseCaseReason: CloseReason;
  AdditionalDetail: string;
  WithdrawalFullName: string;
  WithdrawalRequestDate: DateAsString;
  RejectionName: DynamicList;
  RejectionReason: CloseCaseRejectionReason;
  RejectionDetails: string;
  ConcessionDate: DateAsString;
  ConsentOrderDate: DateAsString;
  Rule27DecisionDate: DateAsString;
  StrikeOutName: DynamicList;
  StrikeOutReason: CloseCaseStrikeOutReason;
  StrikeOutDetails: string;
  Documents: ListValue<CaseworkerCICDocument>[];
  DocumentsUpload: ListValue<CaseworkerCICDocumentUpload>[];
}

export interface ContactParties {
  subjectContactParties: SubjectCIC[];
  respondent: RespondentCIC[];
  representativeContactParties: RepresentativeCIC[];
  applicantContactParties: ApplicantCIC[];
  tribunal: TribunalCIC[];
  message: string;
}

export interface ContactPartiesDocuments {
  DocumentList: DynamicMultiSelectList;
}

export interface DateModel {
  dueDate: DateAsString;
  information: string;
  orderMarkAsCompleted: GetAmendDateAsCompleted[];
}

export interface DocumentManagement {
  CaseworkerCICDocument: ListValue<CaseworkerCICDocument>[];
  CaseworkerCICDocumentUpload: ListValue<CaseworkerCICDocumentUpload>[];
}

export interface DraftOrderCIC {
  templateGeneratedDocument: any;
  orderContentOrderTemplate: OrderTemplate;
  orderContentMainContent: string;
  orderContentOrderSignature: string;
}

export interface DraftOrderContentCIC {
  OrderTemplate: OrderTemplate;
  MainContent: string;
  OrderSignature: string;
}

export interface EditCicaCaseDetails {
  cicaReferenceNumber: string;
  cicaCaseWorker?: string;
  cicaCasePresentingOfficer?: string;
}

export interface HearingSummary {
  judge: DynamicList;
  judgeList: ListValue<Judge>[];
  names: DynamicList;
  isFullPanel: FullPanelHearing;
  memberList: ListValue<PanelMember>[];
  roles: HearingAttendeesRole[];
  others: string;
  outcome: HearingOutcome;
  adjournmentReasons: AdjournmentReasons;
  otherDetailsOfAdjournment: string;
  subjectName: string;
  recDesc: string;
  recFile: ListValue<CaseworkerCICDocument>[];
  recFileUpload: ListValue<CaseworkerCICDocumentUpload>[];
  panel1: string;
  panel2: SecondPanelMember;
  panel3: ThirdPanelMember;
  panelMemberInformation: string;
  panelComposition: PanelComposition;
}

export interface Judge {
  uuid: string;
  judgeFullName: string;
  personalCode: string;
}

export interface Listing {
  hearingCreatedDate: DateAsString;
  hearingStatus: HearingState;
  postponeDate: DateAsString;
  postponeReason: PostponeReason;
  postponeAdditionalInformation: string;
  cancelledDate: DateAsString;
  hearingCancellationReason: HearingCancellationReason;
  cancelHearingAdditionalDetail: string;
  selectedRegionId: string;
  hearingType: HearingType;
  hearingFormat: HearingFormat;
  shortNotice: YesOrNo;
  hearingVenues: DynamicList;
  regionList: DynamicList;
  venueNotListedOption: VenueNotListed[];
  hearingVenueNameAndAddress: string;
  readOnlyHearingVenueName: string;
  roomAtVenue: string;
  addlInstr: string;
  date: DateAsString;
  hearingTime: string;
  session: HearingSession;
  numberOfDays: YesOrNo;
  additionalHearingDate: ListValue<HearingDate>[];
  hearingVenuesMessage: string;
  regionsMessage: string;
  videoCallLink: string;
  conferenceCallNumber: string;
  importantInfoDetails: string;
  recordListingChangeReason: string;
  hearingSummaryExists: string;
  judge: DynamicList;
  judgeList: ListValue<Judge>[];
  names: DynamicList;
  isFullPanel: FullPanelHearing;
  memberList: ListValue<PanelMember>[];
  roles: HearingAttendeesRole[];
  others: string;
  outcome: HearingOutcome;
  adjournmentReasons: AdjournmentReasons;
  otherDetailsOfAdjournment: string;
  subjectName: string;
  recDesc: string;
  recFile: ListValue<CaseworkerCICDocument>[];
  recFileUpload: ListValue<CaseworkerCICDocumentUpload>[];
  panel1: string;
  panel2: SecondPanelMember;
  panel3: ThirdPanelMember;
  panelMemberInformation: string;
  panelComposition: PanelComposition;
}

export interface Order {
  dueDateList: ListValue<DateModel>[];
  uploadedFile: ListValue<CICDocument>[];
  draftOrder: DraftOrderCIC;
  reminderDay: ReminderDays;
  parties: string;
  orderDueDates: ListValue<DateModel>[];
  orderSentDate: DateAsString;
}

export interface ReferToJudge {
  ReferralReason: ReferralReason;
  ReasonForReferral: string;
  AdditionalInformation: string;
  ReferralDate: DateAsString;
}

export interface ReferToLegalOfficer {
  ReferralReason: ReferralReason;
  ReasonForReferral: string;
  AdditionalInformation: string;
  ReferralDate: DateAsString;
}

export interface RemoveCaseStay {
  StayRemoveReason: StayRemoveReason;
  AdditionalDetail: string;
  StayRemoveOtherDescription: string;
}

export interface Document {
  classification: Classification;
  size: number;
  mimeType: string;
  originalDocumentName: string;
  createdOn: DateAsString;
  modifiedOn: DateAsString;
  createdBy: string;
  lastModifiedBy: string;
  ttl: DateAsString;
  hashToken: string;
  metadata: { [index: string]: string };
  _links: Links;
}

export interface UploadResponse {
  documents: Document[];
}

export interface CaseData {
  caseLinks: ListValue<CaseLink>[];
  flagLauncher: FlagLauncher;
  caseNameHmctsInternal: string;
  caseManagementLocation: CaseManagementLocation;
  caseManagementCategory: DynamicList;
  caseFlags: Flags;
  subjectFlags: Flags;
  representativeFlags: Flags;
  applicantFlags: Flags;
  allCaseworkerCICDocument: ListValue<CaseworkerCICDocument>[];
  allCaseworkerCICDocumentUpload: ListValue<CaseworkerCICDocumentUpload>[];
  newCaseworkerCICDocument: ListValue<CaseworkerCICDocument>[];
  newCaseworkerCICDocumentUpload: ListValue<CaseworkerCICDocumentUpload>[];
  editCicaCaseDetails: EditCicaCaseDetails;
  orderContentOrderTemplate: OrderTemplate;
  orderContentMainContent: string;
  orderContentOrderSignature: string;
  contactParties: ContactParties;
  securityClass: SecurityClass;
  caseBundles: ListValue<Bundle>[];
  cicCaseReferralTypeForWA: string;
  cicCaseOrderTemplateIssued: any;
  cicCaseDraftOrderDynamicList: DynamicList;
  cicCaseFlagDynamicList: DynamicList;
  cicCaseOrderDynamicList: DynamicList;
  cicCaseHearingList: DynamicList;
  cicCaseHearingSummaryList: DynamicList;
  cicCaseContactPartiesCIC: ContactPartiesCIC[];
  cicCaseOrderIssuingType: OrderIssuingType;
  cicCaseDraftOrderCICList: ListValue<DraftOrderCIC>[];
  cicCaseOrderDueDates: ListValue<DateModel>[];
  cicCaseSelectedOrder: any;
  cicCaseOrderReminderYesOrNo: YesNo;
  cicCaseOrderReminderDays: ReminderDays;
  cicCaseOrderList: ListValue<Order>[];
  cicCaseOrderDocumentList: ListValue<CaseworkerCICDocument>[];
  cicCaseAmendDocumentList: DynamicList;
  cicCaseSelectedDocumentCategory: DocumentType;
  cicCaseSelectedDocumentEmailContent: string;
  cicCaseSelectedDocumentLink: any;
  cicCaseHearingNotificationParties: NotificationParties[];
  cicCaseSelectedDocumentType: string;
  cicCaseIsDocumentCreatedFromTemplate: YesOrNo;
  cicCaseOrderFile: ListValue<CICDocument>[];
  cicCaseCaseCategory: CaseCategory;
  cicCaseCaseSubcategory: CaseSubcategory;
  cicCaseCaseReceivedDate: DateAsString;
  cicCaseIsTribunalApplicationOnTime: YesOrNo;
  cicCaseIsLateTribunalApplicationReasonGiven: YesOrNo;
  cicCasePartiesCIC: PartiesCIC[];
  cicCaseSubjectCIC: SubjectCIC[];
  cicCaseApplicantCIC: ApplicantCIC[];
  cicCaseRepresentativeCIC: RepresentativeCIC[];
  cicCaseNotifyPartyApplicant: ApplicantCIC[];
  cicCaseNotifyPartySubject: SubjectCIC[];
  cicCaseNotifyPartyRepresentative: RepresentativeCIC[];
  cicCaseNotifyPartyRespondent: RespondentCIC[];
  cicCaseNotifyPartyMessage: string;
  cicCaseReinstateReason: ReinstateReason;
  cicCaseReinstateAdditionalDetail: string;
  cicCaseRespondentName: string;
  cicCaseRespondentOrganisation: string;
  cicCaseRespondentEmail: string;
  cicCaseFullName: string;
  cicCaseAddress: AddressGlobalUK;
  cicCasePhoneNumber: string;
  cicCaseEmail: string;
  cicCaseDateOfBirth: DateAsString;
  cicCaseContactPreferenceType: ContactPreferenceType;
  cicCaseSchemeCic: SchemeCic;
  cicCaseRegionCIC: RegionCIC;
  cicCaseCicaReferenceNumber: string;
  cicCaseInitialCicaDecisionDate: DateAsString;
  cicCaseApplicantFullName: string;
  cicCaseApplicantAddress: AddressGlobalUK;
  cicCaseApplicantPhoneNumber: string;
  cicCaseApplicantEmailAddress: string;
  cicCaseApplicantDateOfBirth: DateAsString;
  cicCaseApplicantContactDetailsPreference: ContactPreferenceType;
  cicCaseRepresentativeFullName: string;
  cicCaseRepresentativeOrgName: string;
  cicCaseRepresentativeReference: string;
  cicCaseRepresentativeAddress: AddressGlobalUK;
  cicCaseRepresentativePhoneNumber: string;
  cicCaseRepresentativeEmailAddress: string;
  cicCaseRepresentativeDateOfBirth: DateAsString;
  cicCaseRepresentativeContactDetailsPreference: ContactPreferenceType;
  cicCaseIsRepresentativeQualified: YesOrNo;
  cicCaseRepresentativeDetailsObjects: YesOrNo;
  cicCaseFormReceivedInTime: YesOrNo;
  cicCaseMissedTheDeadLineCic: YesOrNo;
  cicCaseClaimLinkedToCic: YesOrNo;
  cicCaseCompensationClaimLinkCIC: YesOrNo;
  cicCaseCaseNumber: string;
  cicCaseIsRepresentativePresent: YesOrNo;
  cicCaseApplicantDocumentsUploaded: ListValue<CaseworkerCICDocument>[];
  cicCaseCaseDocumentsUpload: ListValue<CaseworkerCICDocumentUpload>[];
  cicCaseReinstateDocuments: ListValue<CaseworkerCICDocument>[];
  cicCaseReinstateDocumentsUpload: ListValue<CaseworkerCICDocumentUpload>[];
  cicCaseDecisionDocumentList: ListValue<CaseworkerCICDocument>[];
  cicCaseRemovedDocumentList: ListValue<CaseworkerCICDocument>[];
  cicCaseFinalDecisionDocumentList: ListValue<CaseworkerCICDocument>[];
  cicCaseSelectedCheckBox: YesOrNo;
  cicCaseDays: string;
  cicCaseSubjectNotifyList: NotificationResponse;
  cicCaseAppNotificationResponse: NotificationResponse;
  cicCaseRepNotificationResponse: NotificationResponse;
  cicCaseTribunalNotificationResponse: NotificationResponse;
  cicCaseResNotificationResponse: NotificationResponse;
  cicCaseSubjectLetterNotifyList: NotificationResponse;
  cicCaseAppLetterNotificationResponse: NotificationResponse;
  cicCaseSubHearingNotificationResponse: NotificationResponse;
  cicCaseRepHearingNotificationResponse: NotificationResponse;
  cicCaseResHearingNotificationResponse: NotificationResponse;
  cicCaseRepLetterNotificationResponse: NotificationResponse;
  cicCaseFirstDueDate: string;
  notificationsIsNamedPartySubject: YesOrNo;
  notificationsIsNamedPartyApplicant: YesOrNo;
  notificationsIsNamedPartySubjectRep: YesOrNo;
  caseStatus: State;
  caseNumber: string;
  subjectRepFullName: string;
  schemeLabel: string;
  bundleConfiguration: MultiBundleConfig;
  multiBundleConfiguration: MultiBundleConfig[];
  caseDocuments: AbstractCaseworkerCICDocument<CaseworkerCICDocument>[];
  hearingDate: DateAsString;
  hearingLocation: string;
  dueDate: DateAsString;
  notes: ListValue<CaseNote>[];
  stayStayReason: StayReason;
  stayAdditionalDetail: string;
  stayExpirationDate: DateAsString;
  stayFlagType: string;
  stayIsCaseStayed: YesOrNo;
  hearingCreatedDate: DateAsString;
  hearingStatus: HearingState;
  postponeDate: DateAsString;
  postponeReason: PostponeReason;
  postponeAdditionalInformation: string;
  cancelledDate: DateAsString;
  hearingCancellationReason: HearingCancellationReason;
  cancelHearingAdditionalDetail: string;
  selectedRegionId: string;
  hearingType: HearingType;
  hearingFormat: HearingFormat;
  shortNotice: YesOrNo;
  hearingVenues: DynamicList;
  regionList: DynamicList;
  venueNotListedOption: VenueNotListed[];
  hearingVenueNameAndAddress: string;
  readOnlyHearingVenueName: string;
  roomAtVenue: string;
  addlInstr: string;
  date: DateAsString;
  hearingTime: string;
  session: HearingSession;
  numberOfDays: YesOrNo;
  additionalHearingDate: ListValue<HearingDate>[];
  hearingVenuesMessage: string;
  regionsMessage: string;
  videoCallLink: string;
  conferenceCallNumber: string;
  importantInfoDetails: string;
  recordListingChangeReason: string;
  hearingSummaryExists: string;
  judge: DynamicList;
  judgeList: ListValue<Judge>[];
  names: DynamicList;
  isFullPanel: FullPanelHearing;
  memberList: ListValue<PanelMember>[];
  roles: HearingAttendeesRole[];
  others: string;
  outcome: HearingOutcome;
  adjournmentReasons: AdjournmentReasons;
  otherDetailsOfAdjournment: string;
  subjectName: string;
  recDesc: string;
  recFile: ListValue<CaseworkerCICDocument>[];
  recFileUpload: ListValue<CaseworkerCICDocumentUpload>[];
  panel1: string;
  panel2: SecondPanelMember;
  panel3: ThirdPanelMember;
  panelMemberInformation: string;
  panelComposition: PanelComposition;
  nhhearingCreatedDate: DateAsString;
  nhhearingStatus: HearingState;
  nhpostponeDate: DateAsString;
  nhpostponeReason: PostponeReason;
  nhpostponeAdditionalInformation: string;
  nhcancelledDate: DateAsString;
  nhhearingCancellationReason: HearingCancellationReason;
  nhcancelHearingAdditionalDetail: string;
  nhselectedRegionId: string;
  nhhearingType: HearingType;
  nhhearingFormat: HearingFormat;
  nhshortNotice: YesOrNo;
  nhhearingVenues: DynamicList;
  nhregionList: DynamicList;
  nhvenueNotListedOption: VenueNotListed[];
  nhhearingVenueNameAndAddress: string;
  nhreadOnlyHearingVenueName: string;
  nhroomAtVenue: string;
  nhaddlInstr: string;
  nhdate: DateAsString;
  nhhearingTime: string;
  nhsession: HearingSession;
  nhnumberOfDays: YesOrNo;
  nhadditionalHearingDate: ListValue<HearingDate>[];
  nhhearingVenuesMessage: string;
  nhregionsMessage: string;
  nhvideoCallLink: string;
  nhconferenceCallNumber: string;
  nhimportantInfoDetails: string;
  nhrecordListingChangeReason: string;
  nhhearingSummaryExists: string;
  nhjudge: DynamicList;
  nhjudgeList: ListValue<Judge>[];
  nhnames: DynamicList;
  nhisFullPanel: FullPanelHearing;
  nhmemberList: ListValue<PanelMember>[];
  nhroles: HearingAttendeesRole[];
  nhothers: string;
  nhoutcome: HearingOutcome;
  nhadjournmentReasons: AdjournmentReasons;
  nhotherDetailsOfAdjournment: string;
  nhsubjectName: string;
  nhrecDesc: string;
  nhrecFile: ListValue<CaseworkerCICDocument>[];
  nhrecFileUpload: ListValue<CaseworkerCICDocumentUpload>[];
  nhpanel1: string;
  nhpanel2: SecondPanelMember;
  nhpanel3: ThirdPanelMember;
  nhpanelMemberInformation: string;
  nhpanelComposition: PanelComposition;
  lhhearingCreatedDate: DateAsString;
  lhhearingStatus: HearingState;
  lhpostponeDate: DateAsString;
  lhpostponeReason: PostponeReason;
  lhpostponeAdditionalInformation: string;
  lhcancelledDate: DateAsString;
  lhhearingCancellationReason: HearingCancellationReason;
  lhcancelHearingAdditionalDetail: string;
  lhselectedRegionId: string;
  lhhearingType: HearingType;
  lhhearingFormat: HearingFormat;
  lhshortNotice: YesOrNo;
  lhhearingVenues: DynamicList;
  lhregionList: DynamicList;
  lhvenueNotListedOption: VenueNotListed[];
  lhhearingVenueNameAndAddress: string;
  lhreadOnlyHearingVenueName: string;
  lhroomAtVenue: string;
  lhaddlInstr: string;
  lhdate: DateAsString;
  lhhearingTime: string;
  lhsession: HearingSession;
  lhnumberOfDays: YesOrNo;
  lhadditionalHearingDate: ListValue<HearingDate>[];
  lhhearingVenuesMessage: string;
  lhregionsMessage: string;
  lhvideoCallLink: string;
  lhconferenceCallNumber: string;
  lhimportantInfoDetails: string;
  lhrecordListingChangeReason: string;
  lhhearingSummaryExists: string;
  lhjudge: DynamicList;
  lhjudgeList: ListValue<Judge>[];
  lhnames: DynamicList;
  lhisFullPanel: FullPanelHearing;
  lhmemberList: ListValue<PanelMember>[];
  lhroles: HearingAttendeesRole[];
  lhothers: string;
  lhoutcome: HearingOutcome;
  lhadjournmentReasons: AdjournmentReasons;
  lhotherDetailsOfAdjournment: string;
  lhsubjectName: string;
  lhrecDesc: string;
  lhrecFile: ListValue<CaseworkerCICDocument>[];
  lhrecFileUpload: ListValue<CaseworkerCICDocumentUpload>[];
  lhpanel1: string;
  lhpanel2: SecondPanelMember;
  lhpanel3: ThirdPanelMember;
  lhpanelMemberInformation: string;
  lhpanelComposition: PanelComposition;
  hearingList: ListValue<Listing>[];
  removeStayStayRemoveReason: StayRemoveReason;
  removeStayAdditionalDetail: string;
  removeStayStayRemoveOtherDescription: string;
  note: string;
  hyphenatedCaseRef: string;
  isJudicialSeparation: YesOrNo;
  closureDate: DateAsString;
  closedDayCount: string;
  caseFileView1: ComponentLauncher;
  currentEvent: string;
  decisionSignature: string;
  decisionMainContent: string;
  messages: ListValue<DssMessage>[];
  issueCaseDocumentList: DynamicMultiSelectList;
  contactPartiesDocumentsDocumentList: DynamicMultiSelectList;
  caseIssueDecisionDecisionNotice: NoticeOption;
  caseIssueDecisionIssueDecisionTemplate: DecisionTemplate;
  caseIssueDecisionIssueDecisionDraft: any;
  caseIssueDecisionDecisionDocument: CICDocument;
  caseIssueFinalDecisionFinalDecisionNotice: NoticeOption;
  caseIssueFinalDecisionDecisionTemplate: DecisionTemplate;
  caseIssueFinalDecisionFinalDecisionDraft: any;
  caseIssueFinalDecisionFinalDecisionGuidance: any;
  caseIssueFinalDecisionDocument: CICDocument;
  closeCloseCaseReason: CloseReason;
  closeAdditionalDetail: string;
  closeWithdrawalFullName: string;
  closeWithdrawalRequestDate: DateAsString;
  closeRejectionName: DynamicList;
  closeRejectionReason: CloseCaseRejectionReason;
  closeRejectionDetails: string;
  closeConcessionDate: DateAsString;
  closeConsentOrderDate: DateAsString;
  closeRule27DecisionDate: DateAsString;
  closeStrikeOutName: DynamicList;
  closeStrikeOutReason: CloseCaseStrikeOutReason;
  closeStrikeOutDetails: string;
  closeDocuments: ListValue<CaseworkerCICDocument>[];
  closeDocumentsUpload: ListValue<CaseworkerCICDocumentUpload>[];
  referToJudgeReferralReason: ReferralReason;
  referToJudgeReasonForReferral: string;
  referToJudgeAdditionalInformation: string;
  referToJudgeReferralDate: DateAsString;
  referToLegalOfficerReferralReason: ReferralReason;
  referToLegalOfficerReasonForReferral: string;
  referToLegalOfficerAdditionalInformation: string;
  referToLegalOfficerReferralDate: DateAsString;
  dssCaseDataCaseTypeOfApplication: string;
  dssCaseDataSubjectFullName: string;
  dssCaseDataSubjectDateOfBirth: DateAsString;
  dssCaseDataSubjectEmailAddress: string;
  dssCaseDataSubjectContactNumber: string;
  dssCaseDataSubjectAgreeContact: YesOrNo;
  dssCaseDataRepresentation: YesOrNo;
  dssCaseDataRepresentationQualified: YesOrNo;
  dssCaseDataRepresentativeFullName: string;
  dssCaseDataRepresentativeOrganisationName: string;
  dssCaseDataRepresentativeContactNumber: string;
  dssCaseDataRepresentativeEmailAddress: string;
  dssCaseDataDocumentRelevance: string;
  dssCaseDataAdditionalInformation: string;
  dssCaseDataPcqId: string;
  dssCaseDataSubjectNotificationResponse: NotificationResponse;
  dssCaseDataRepNotificationResponse: NotificationResponse;
  dssCaseDataNotificationParties: NotificationParties[];
  dssCaseDataTribunalFormDocuments: ListValue<EdgeCaseDocument>[];
  dssCaseDataSupportingDocuments: ListValue<EdgeCaseDocument>[];
  dssCaseDataOtherInfoDocuments: ListValue<EdgeCaseDocument>[];
  dssCaseDataNotifyPartyMessage: string;
  dssCaseDataIsRepresentativePresent: YesOrNo;
  dssCaseDataLanguagePreference: LanguagePreference;
  pcqId: string;
  dssQuestion1: string;
  dssAnswer1: string;
  dssQuestion2: string;
  dssAnswer2: string;
  dssQuestion3: string;
  dssAnswer3: string;
  uploadedDssDocuments: ListValue<DssUploadedDocument>[];
  dssHeaderDetails: string;
  hasDssNotificationSent: YesOrNo;
  firstHearingDate: string;
  hearingVenueName: string;
  judicialId: string;
  stitchHearingBundleTask: YesNo;
  completeHearingOutcomeTask: YesNo;
  dataVersion: number;
  cicBundles: ListValue<Bundle>[];
  cicCaseCancelHearingAdditionalDetail: string;
  cicCaseHearingCancellationReason: HearingCancellationReason;
  cicCasePostponeReason: PostponeReason;
  cicCasePostponeAdditionalInformation: string;
  cicCaseAppellantFlags: ListValue<Flags>[];
  cicCaseCaseFlags: ListValue<Flags>[];
  cicCaseRespondentFlags: ListValue<Flags>[];
  cicCaseFlagType: FlagType;
  cicCaseFlagAdditionalDetail: string;
  cicCaseFlagOtherDescription: string;
  cicCaseFlagLevel: FlagLevel;
  cicCaseLinkCaseNumber: CaseLink;
  cicCaseLinkCaseReason: LinkCaseReason;
  cicCaseLinkCaseOtherDescription: string;
  cicCaseCaseLinks: ListValue<CaseLinks>[];
  cicCaseTestState: State;
  cicCaseSelectedDocument: CaseworkerCICDocument;
  searchCriteria: SearchCriteria;
  LinkedCasesComponentLauncher: ComponentLauncher;
}

export interface CicCase {
  ReferralTypeForWA: string;
  OrderTemplateIssued: any;
  DraftOrderDynamicList: DynamicList;
  FlagDynamicList: DynamicList;
  OrderDynamicList: DynamicList;
  HearingList: DynamicList;
  HearingSummaryList: DynamicList;
  ContactPartiesCIC: ContactPartiesCIC[];
  OrderIssuingType: OrderIssuingType;
  DraftOrderCICList: ListValue<DraftOrderCIC>[];
  OrderDueDates: ListValue<DateModel>[];
  SelectedOrder: any;
  OrderReminderYesOrNo: YesNo;
  OrderReminderDays: ReminderDays;
  OrderList: ListValue<Order>[];
  OrderDocumentList: ListValue<CaseworkerCICDocument>[];
  AmendDocumentList: DynamicList;
  SelectedDocumentCategory: DocumentType;
  SelectedDocumentEmailContent: string;
  SelectedDocumentLink: any;
  HearingNotificationParties: NotificationParties[];
  SelectedDocumentType: string;
  IsDocumentCreatedFromTemplate: YesOrNo;
  OrderFile: ListValue<CICDocument>[];
  CaseCategory: CaseCategory;
  CaseSubcategory: CaseSubcategory;
  CaseReceivedDate: DateAsString;
  IsTribunalApplicationOnTime: YesOrNo;
  IsLateTribunalApplicationReasonGiven: YesOrNo;
  PartiesCIC: PartiesCIC[];
  SubjectCIC: SubjectCIC[];
  ApplicantCIC: ApplicantCIC[];
  RepresentativeCIC: RepresentativeCIC[];
  NotifyPartyApplicant: ApplicantCIC[];
  NotifyPartySubject: SubjectCIC[];
  NotifyPartyRepresentative: RepresentativeCIC[];
  NotifyPartyRespondent: RespondentCIC[];
  NotifyPartyMessage: string;
  ReinstateReason: ReinstateReason;
  ReinstateAdditionalDetail: string;
  RespondentName: string;
  RespondentOrganisation: string;
  RespondentEmail: string;
  FullName: string;
  Address: AddressGlobalUK;
  PhoneNumber: string;
  Email: string;
  DateOfBirth: DateAsString;
  ContactPreferenceType: ContactPreferenceType;
  SchemeCic: SchemeCic;
  RegionCIC: RegionCIC;
  CicaReferenceNumber: string;
  InitialCicaDecisionDate: DateAsString;
  ApplicantFullName: string;
  ApplicantAddress: AddressGlobalUK;
  ApplicantPhoneNumber: string;
  ApplicantEmailAddress: string;
  ApplicantDateOfBirth: DateAsString;
  ApplicantContactDetailsPreference: ContactPreferenceType;
  RepresentativeFullName: string;
  RepresentativeOrgName: string;
  RepresentativeReference: string;
  RepresentativeAddress: AddressGlobalUK;
  RepresentativePhoneNumber: string;
  RepresentativeEmailAddress: string;
  RepresentativeDateOfBirth: DateAsString;
  RepresentativeContactDetailsPreference: ContactPreferenceType;
  IsRepresentativeQualified: YesOrNo;
  RepresentativeDetailsObjects: YesOrNo;
  FormReceivedInTime: YesOrNo;
  MissedTheDeadLineCic: YesOrNo;
  ClaimLinkedToCic: YesOrNo;
  CompensationClaimLinkCIC: YesOrNo;
  CaseNumber: string;
  IsRepresentativePresent: YesOrNo;
  ApplicantDocumentsUploaded: ListValue<CaseworkerCICDocument>[];
  CaseDocumentsUpload: ListValue<CaseworkerCICDocumentUpload>[];
  ReinstateDocuments: ListValue<CaseworkerCICDocument>[];
  ReinstateDocumentsUpload: ListValue<CaseworkerCICDocumentUpload>[];
  DecisionDocumentList: ListValue<CaseworkerCICDocument>[];
  RemovedDocumentList: ListValue<CaseworkerCICDocument>[];
  FinalDecisionDocumentList: ListValue<CaseworkerCICDocument>[];
  SelectedCheckBox: YesOrNo;
  Days: string;
  SubjectNotifyList: NotificationResponse;
  AppNotificationResponse: NotificationResponse;
  RepNotificationResponse: NotificationResponse;
  TribunalNotificationResponse: NotificationResponse;
  ResNotificationResponse: NotificationResponse;
  SubjectLetterNotifyList: NotificationResponse;
  AppLetterNotificationResponse: NotificationResponse;
  SubHearingNotificationResponse: NotificationResponse;
  RepHearingNotificationResponse: NotificationResponse;
  ResHearingNotificationResponse: NotificationResponse;
  RepLetterNotificationResponse: NotificationResponse;
  FirstDueDate: string;
}

export interface DssCaseData extends MappableObject {
  CaseTypeOfApplication: string;
  SubjectFullName: string;
  SubjectDateOfBirth: DateAsString;
  SubjectEmailAddress: string;
  SubjectContactNumber: string;
  SubjectAgreeContact: YesOrNo;
  Representation: YesOrNo;
  RepresentationQualified: YesOrNo;
  RepresentativeFullName: string;
  RepresentativeOrganisationName: string;
  RepresentativeContactNumber: string;
  RepresentativeEmailAddress: string;
  DocumentRelevance: string;
  AdditionalInformation: string;
  PcqId: string;
  SubjectNotificationResponse: NotificationResponse;
  RepNotificationResponse: NotificationResponse;
  NotificationParties: NotificationParties[];
  TribunalFormDocuments: ListValue<EdgeCaseDocument>[];
  SupportingDocuments: ListValue<EdgeCaseDocument>[];
  OtherInfoDocuments: ListValue<EdgeCaseDocument>[];
  NotifyPartyMessage: string;
  IsRepresentativePresent: YesOrNo;
  LanguagePreference: LanguagePreference;
}

export interface DssDocumentInfo {
  document: any;
  comment: string;
}

export interface DssMessage extends MappableObject {
  dateReceived: DateAsString;
  receivedFrom: string;
  message: string;
  documentRelevance: string;
  otherInfoDocument: CaseworkerCICDocument;
}

export interface DssUploadedDocument {
  dssDocuments: ListValue<DssDocumentInfo>[];
  dssAdditionalCaseInformation: string;
  dssCaseUpdatedBy: string;
}

export interface ExtendedCaseDetails {
  id: number;
  data_classification: { [index: string]: any };
}

export interface FurtherCICDetails {
  SchemeCic: SchemeCic;
}

export interface HearingDate {
  hearingVenueDate: DateAsString;
  hearingVenueSession: HearingSession;
  hearingVenueTime: string;
}

export interface HearingNoticeDocuments {
  applicantDocumentsUploaded: ListValue<HearingNoticeDocument>[];
}

export interface NotificationResponse {
  id: string;
  clientReference: string;
  notificationType: NotificationType;
  createdAtTime: DateAsString;
  updatedAtTime: DateAsString;
  status: string;
}

export interface Notifications {
  IsNamedPartySubject: YesOrNo;
  IsNamedPartyApplicant: YesOrNo;
  IsNamedPartySubjectRep: YesOrNo;
}

export interface PanelMember {
  name: DynamicList;
  role: PanelMembersRole;
}

export interface RetiredFields {
  dataVersion: number;
  cicBundles: ListValue<Bundle>[];
  cicCaseCancelHearingAdditionalDetail: string;
  cicCaseHearingCancellationReason: HearingCancellationReason;
  cicCasePostponeReason: PostponeReason;
  cicCasePostponeAdditionalInformation: string;
  cicCaseAppellantFlags: ListValue<Flags>[];
  cicCaseCaseFlags: ListValue<Flags>[];
  cicCaseRespondentFlags: ListValue<Flags>[];
  cicCaseFlagType: FlagType;
  cicCaseFlagAdditionalDetail: string;
  cicCaseFlagOtherDescription: string;
  cicCaseFlagLevel: FlagLevel;
  cicCaseLinkCaseNumber: CaseLink;
  cicCaseLinkCaseReason: LinkCaseReason;
  cicCaseLinkCaseOtherDescription: string;
  cicCaseCaseLinks: ListValue<CaseLinks>[];
  cicCaseTestState: State;
  cicCaseSelectedDocument: CaseworkerCICDocument;
}

export interface DssCaseDataRequest {
  dssCaseDataCaseTypeOfApplication: string;
  dssCaseDataSubjectFullName: string;
  dssCaseDataSubjectDateOfBirth: DateAsString;
  dssCaseDataSubjectEmailAddress: string;
  dssCaseDataSubjectContactNumber: string;
  dssCaseDataSubjectAgreeContact: YesOrNo;
  dssCaseDataRepresentation: YesOrNo;
  dssCaseDataRepresentationQualified: YesOrNo;
  dssCaseDataRepresentativeFullName: string;
  dssCaseDataRepresentativeOrganisationName: string;
  dssCaseDataRepresentativeContactNumber: string;
  dssCaseDataRepresentativeEmailAddress: string;
  dssCaseDataDocumentRelevance: string;
  dssCaseDataAdditionalInformation: string;
  dssCaseDataPcqId: string;
  dssCaseDataTribunalFormDocuments: ListValue<EdgeCaseDocument>[];
  dssCaseDataSupportingDocuments: ListValue<EdgeCaseDocument>[];
  dssCaseDataOtherInfoDocuments: ListValue<EdgeCaseDocument>[];
  dssCaseDataIsRepresentativePresent: YesOrNo;
  dssCaseDataLanguagePreference: LanguagePreference;
}

export interface Bundle {
  id: string;
  title: string;
  description: string;
  stitchedDocument: any;
  documents: ListValue<BundleDocument>[];
  folders: ListValue<BundleFolder>[];
  paginationStyle: BundlePaginationStyle;
  pageNumberFormat: PageNumberFormat;
  stitchingFailureMessage: string;
  documentImage: DocumentImage;
  stitchStatus: string;
  eligibleForStitching: YesOrNo;
  eligibleForCloning: YesOrNo;
  hasCoversheets: YesOrNo;
  hasTableOfContents: YesOrNo;
  hasFolderCoversheets: YesOrNo;
  enableEmailNotification: YesOrNo;
  fileName: string;
  fileNameIdentifier: string;
  coverpageTemplate: string;
}

export interface BundleCallback extends Callback {
  caseTypeId: string;
  jurisdictionId: string;
}

export interface BundleDocument {
  name: string;
  description: string;
  sortIndex: number;
  sourceDocument: any;
}

export interface BundleFolder {
  name: string;
  documents: ListValue<BundleDocument>[];
  folders: ListValue<BundleSubFolder>[];
  sortIndex: number;
}

export interface BundleSubFolder {
  name: string;
  documents: ListValue<BundleDocument>[];
  folders: ListValue<BundleSubFolder2>[];
  sortIndex: number;
}

export interface BundleSubFolder2 {
  name: string;
  documents: ListValue<BundleDocument>[];
  sortIndex: number;
}

export interface Callback {
  case_details: CaseDetails<CaseData, State>;
  case_details_before: CaseDetails<CaseData, State>;
  page_id: string;
  event_id: string;
  ignore_warning: boolean;
}

export interface DocumentImage {
  docmosisAssetId: string;
  imageRenderingLocation: ImageRenderingLocation;
  coordinateX: number;
  coordinateY: number;
  imageRendering: ImageRendering;
}

export interface MultiBundleConfig {
  value: string;
}

export interface AbstractCaseworkerCICDocument<D> {
  value: D;
}

export interface CICDocument {
  documentEmailContent: string;
  documentLink: any;
}

export interface CaseworkerCICDocument {
  documentCategory: DocumentType;
  documentEmailContent: string;
  documentLink: any;
  date: DateAsString;
}

export interface CaseworkerCICDocumentUpload {
  documentCategory: DocumentType;
  documentEmailContent: string;
  documentLink: any;
}

export interface DocAssemblyRequest {
  templateId: string;
  outputType: string;
  formPayload: any;
  outputFilename: string;
  secureDocStoreEnabled: boolean;
  caseTypeId: string;
  jurisdictionId: string;
}

export interface DocAssemblyResponse {
  renditionOutputLocation: string;
  binaryFilePath: string;
}

export interface DocumentInfo {
  url: string;
  filename: string;
  binaryUrl: string;
  categoryId: string;
}

export interface EdgeCaseDocument {
  documentLink: any;
  comment: string;
}

export interface GeneratedDocumentInfo {
  url: string;
  mimeType: string;
  createdOn: string;
  hashToken: string;
  binaryUrl: string;
}

export interface HearingNoticeDocument {
  documentEmailContent: string;
  documentLink: any;
}

export interface AppointmentRefreshResponse {
  base_location_id: string;
  epimms_id: string;
  court_name: string;
  cft_region_id: string;
  cft_region: string;
  location_id: string;
  location: string;
  is_principal_appointment: string;
  appointment: string;
  appointment_type: string;
  service_code: string;
  roles: string[];
  start_date: string;
  end_date: string;
}

export interface AuthorisationRefreshResponse {
  jurisdiction: string;
  ticket_description: string;
  ticket_code: string;
  service_codes: string[];
  start_date: string;
  end_date: string;
}

export interface UserProfileRefreshResponse {
  sidam_id: string;
  object_id: string;
  known_as: string;
  surname: string;
  full_name: string;
  post_nominals: string;
  email_id: string;
  personal_code: string;
  appointments: AppointmentRefreshResponse[];
  authorisations: AuthorisationRefreshResponse[];
}

export interface NotificationRequest {
  destinationAddress: string;
  template: TemplateName;
  templateVars: { [index: string]: any };
  hasFileAttachments: boolean;
  uploadedDocuments: { [index: string]: string };
  fileContents: any;
  fileContents1: any;
}

export interface HearingVenue {
  court_venue_id: string;
  court_name: string;
  region_id: string;
  region: string;
  venue_name: string;
  court_address: string;
  court_type_id: string;
}

export interface Region {
  region_id: string;
  description: string;
  welsh_description: string;
}

export interface DateTime extends BaseDateTime, ReadableDateTime, Serializable {}

export interface Links {
  self: DocumentLink;
  binary: DocumentLink;
}

export interface MappableObject {}

export interface CaseDetails<T, S> {
  id: number;
  jurisdiction: string;
  state: S;
  case_type_id: string;
  created_date: DateAsString;
  last_modified: DateAsString;
  locked_by_user_id: number;
  security_level: number;
  case_data: T;
  security_classification: any;
  callback_response_status: string;
}

export interface BaseDateTime extends AbstractDateTime, ReadableDateTime, Serializable {}

export interface ReadableDateTime extends ReadableInstant {}

export interface Serializable {}

export interface DocumentLink {
  href: string;
}

export interface AbstractDateTime extends AbstractInstant, ReadableDateTime {}

export interface ReadableInstant extends Comparable<ReadableInstant> {}

export interface AbstractInstant extends ReadableInstant {}

export interface Comparable<T> {}

export type DateAsString = string;

export const enum ChangeOrganisationApprovalStatus {
  NOT_CONSIDERED = '0',
  APPROVED = '1',
  REJECTED = '2',
}

export const enum FieldType {
  Unspecified = 'Unspecified',
  Email = 'Email',
  PhoneUK = 'PhoneUK',
  Date = 'Date',
  Document = 'Document',
  Schedule = 'Schedule',
  TextArea = 'TextArea',
  FixedList = 'FixedList',
  FixedRadioList = 'FixedRadioList',
  YesOrNo = 'YesOrNo',
  Address = 'Address',
  CaseLink = 'CaseLink',
  CaseLocation = 'CaseLocation',
  OrderSummary = 'OrderSummary',
  MultiSelectList = 'MultiSelectList',
  Collection = 'Collection',
  Label = 'Label',
  CasePaymentHistoryViewer = 'CasePaymentHistoryViewer',
  DynamicRadioList = 'DynamicRadioList',
  DynamicMultiSelectList = 'DynamicMultiSelectList',
  Flags = 'Flags',
  FlagLauncher = 'FlagLauncher',
  FlagType = 'FlagType',
  FlagDetail = 'FlagDetail',
  ComponentLauncher = 'ComponentLauncher',
  SearchCriteria = 'SearchCriteria',
  TTL = 'TTL',
}

export const enum FlagType {
  APPELLANT_ABROAD = 'appellantAbroad',
  OTHER = 'Other',
}

export const enum FlagVisibility {
  INTERNAL = 'Internal',
  EXTERNAL = 'External',
}

export const enum ScannedDocumentType {
  CHERISHED = 'cherished',
  COVERSHEET = 'coversheet',
  FORM = 'form',
  OTHER = 'other',
}

export const enum YesOrNo {
  YES = 'Yes',
  NO = 'No',
}

export const enum CloseCaseRejectionReason {
  CREATED_IN_ERROR = 'createdInError',
  DEADLINE_MISSED = 'deadlineMissed',
  DUPLICATE_CASE = 'duplicateCase',
  VEXATIOUS_LITIGANT = 'vexatiousLitigant',
  OTHER = 'other',
}

export const enum CloseCaseStrikeOutReason {
  NO_JURISDICTION = 'noncomplianceWithDirections',
  OTHER = 'other',
}

export const enum CloseReason {
  Withdrawn = 'caseWithdrawn',
  Rejected = 'caseRejected',
  StrikeOut = 'caseStrikeOut',
  Concession = 'caseConcession',
  ConsentOrder = 'consentOrder',
  Rule27 = 'rule27',
  DeathOfAppellant = 'deathOfAppellant',
}

export const enum ContactPartiesAllowedFileTypes {
  PDF = 'PDF',
  CSV = 'CSV',
  JSON = 'JSON',
  ODT = 'ODT',
  TXT = 'TXT',
  RTF = 'RTF',
  XLSX = 'XLSX',
  DOC = 'DOC',
  DOCX = 'DOCX',
}

export const enum FlagLevel {
  PARTY_LEVEL = 'PartyLevel',
  CASE_LEVEL = 'CaseLevel',
}

export const enum HearingCancellationReason {
  CASE_REJECTED = 'caseRejected',
  CONSENT_ORDER_RECEIVED_AND_NO_TIME_FOR_INFILL = 'consentOrderReceivedAndNoTimeForInfill',
  INCOMPLETE_PANEL = 'incompletePanel',
  NO_SUITABLE_CASES_THAT_ARE_READY_TO_LIST = 'noSuitableCasesThatAreReadyToList',
  REQUEST_FOR_R27_DECISION_AND_NO_TIME_FOR_INFILL = 'RequestForR27DecisionAndNoTimeForInfill',
  VENUE_UNAVAILABLE = 'venueUnavailable',
  OTHER = 'Other',
}

export const enum LinkCaseReason {
  PROGRESSED_AS_PART_OF_LEAD_CASE = 'progressedAsPartOfLeadCase',
  BAIL = 'bail',
  CASE_CONSOLIDATED = 'caseConsolidated',
  FAMILIAL = 'familial',
  GUARDIAN = 'guardian',
  HOME_OFFICE_REQUEST = 'homeOfficeRequest',
  LINKED_FOR_HEARING = 'linkedForHearing',
  SHARED_EVIDENCE = 'sharedEvidence',
  OTHER_APPEAL_DECIDED = 'otherAppealDecided',
  OTHER_APPEAL_PENDING = 'otherAppealPending',
  OTHER = 'other',
}

export const enum NextState {
  CaseManagement = 'CaseManagement',
  NewCasePendingReview = 'NewCasePendingReview',
}

export const enum NoticeOption {
  UPLOAD_FROM_COMPUTER = 'Upload from your computer',
  CREATE_FROM_TEMPLATE = 'Create from a template',
}

export const enum OrderIssuingType {
  ISSUE_AND_SEND_AN_EXISTING_DRAFT = 'DraftOrder',
  UPLOAD_A_NEW_ORDER_FROM_YOUR_COMPUTER = 'UploadOrder',
}

export const enum PostponeReason {
  APPELLANT_IS_OUT_OF_COUNTRY = 'Appellant is out of country',
  APPELLANT_SEEKING_LEGAL_ADVICE = 'Appellant seeking legal advice',
  APPELLANT_UNABLE_TO_ATTEND_FACE_TO_FACE = 'Appellant unable to attend face to face, change of hearing format requested',
  APPELLANT_UNAVAILABLE = 'Appellant unavailable (holiday/work/appointment/unwell)',
  BEREAVEMENT = 'Bereavement',
  CASESTAYED_DUE_TO_CIVIL_PROCEEDINGS = 'Case stayed due to Civil proceedings',
  CICA_REQUESTS_CASE_BE_HEARD_BY_A_SINGLE_JUDGE_AS_A_RULE_27_DECISION = 'CICA requests case be heard by a single Judge as a Rule 27 decision',
  CICA_SEEKING_COUNCIL = 'CICA seeking Counsel',
  EXTENSION_GRANTED = 'Extension granted',
  FACE_TO_FACE_HEARING_REQUIRED = 'Face to face hearing required',
  LAST_MINUTE_SUBMISSION = 'Last minute submissions i.e. 1-2 weeks prior to hearing',
  LINKED_CASE_TO_BE_HEARD_TOGETHER = 'Linked cases - to be heard together',
  MEMBER_EXCLUDED_LISTED_IN_ERROR = 'Member excluded - listed in error',
  REPRESENTATIVE_CANNOT_MAKE_CONTACT_WITH_APPELLANT = 'Representative/Solicitor cannot make contact with Appellant',
  REPRESENTATIVE_SEEKING_FURTHER_EVIDENCE = 'Representative/Solicitor seeking further evidence',
  REPRESENTATIVE_UNAVAILABLE = 'Representative/Solicitor unavailable (holiday/work/appointment/unwell)',
  TRIBUNAL_MEMBER_UNAVAILABLE = 'Tribunal members unavailable (holiday/work/appointment/unwell)',
  TRIBUNAL_MEMBER_DEEMED_LISTING_TIME_DIRECTED_INADEQUATE = 'Tribunal members deemed listing time directed inadequate',
  OTHER = 'Other',
}

export const enum ReferralReason {
  CORRECTIONS = 'corrections',
  LISTED_CASE = 'listedCase',
  LISTED_CASE_WITHIN_5_DAYS = 'listedCaseWithin5Days',
  LISTING_DIRECTIONS = 'listingDirections',
  NEW_CASE = 'newCase',
  POSTPONEMENT_REQUEST = 'postponementRequest',
  REINSTATEMENT_REQUEST = 'reinstatementRequest',
  RULE_27_REQUEST = 'rule27Request',
  SET_ASIDE_REQUEST = 'setAsideRequest',
  STAY_REQUEST = 'stayRequest',
  STRIKE_OUT_REQUEST = 'strikeOutRequest',
  TIME_EXTENSION_REQUEST = 'timeExtensionRequest',
  WITHDRAWAL_REQUEST = 'withdrawalRequest',
  WRITTEN_REASONS_REQUEST = 'writtenReasonsRequest',
  OTHER = 'other',
}

export const enum ReinstateReason {
  REQUEST_FOLLOWING_A_WITHDRAWAL_DECISION = 'requestFollowingAWithdrawalDecision',
  REQUEST_FOLLOWING_A_STRIKE_OUT_DECISION = 'RequestFollowingAStrikeOutDecision',
  CASE_HAD_BEEN_CLOSED_IN_ERROR = 'caseHadBeenClosedInError',
  REQUEST_FOLLOWING_A_DECISION_FROM_THE_UPPER_TRIBUNAL = 'requestFollowingADecisionFromTheUpperTribunal',
  REQUEST_FOLLOWING_AN_ORAL_HEARING_APPLICATION_FOLLOWING_A_RULE_27_DECISION = 'requestFollowingAnOralHearingApplicationFollowingARule27Decision',
  REQUEST_TO_SET_ASIDE_A_TRIBUNAL_DECISION_FOLLOWING_AN_ORAL_HEARING = 'Request to set aside a tribunal decision following an oral hearing',
  OTHER = 'Other',
}

export const enum ReminderDays {
  DAY_COUNT_1 = '1 day',
  DAY_COUNT_3 = '3 days',
  DAY_COUNT_5 = '5 days',
  DAY_COUNT_7 = '7 days',
}

export const enum SecurityClass {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  RESTRICTED = 'Restricted',
}

export const enum StayReason {
  AWAITING_OUTCOME_OF_A_CIVIL_CASE = 'waitingOutcomeOfCivilCase',
  AWAITING_OUTCOME_OF_A_CRIMINAL_PROCEEDINGS = 'awaitingOutcomeOfCriminalProceedings',
  AWAITING_OUTCOME_OF_A_COURT_JUDGEMENT = 'awaitingACourtJudgement',
  UNABLE_TO_PROGRESS_DUE_TO_SUBJECTS_AGE = 'unableToProgressDueToSubject’sAge',
  UNABLE_TO_PROGRESS_AS_SUBJECT_UNDERGOING_OR_AWAITING_TREATMENT = 'unableToProgressAsSubjectUndergoingOrAwaitingTreatment',
  AWAITING_OUTCOME_OF_LINKED_CASE = 'awaitingOutcomeOfLinkedCase',
  OTHER = 'Other',
}

export const enum StayRemoveReason {
  RECEIVED_OUTCOME_OF_CIVIL_CASE = 'receivedOutcomeOfCivilCase',
  RECEIVED_OUTCOME_OF_CRIMINAL_PROCEEDINGS = 'receviedOutcomeOfCriminalProceedings',
  RECEIVED_A_COURT_JUDGEMENT = 'receivedACourtJudgement',
  APPLICANT_HAS_REACHED_REQUIRED_AGE = 'applicantHasReachedRequiredAge',
  SUBJECT_HAS_RECEIVED_THEIR_MEDICAL_TREATMENT = 'subjectHasReceivedTheirMedicalTreatment',
  RECEIVED_OUTCOME_OF_LINKED_CASE = 'receivedOutcomeOfLinkedCase',
  OTHER = 'Other',
}

export const enum YesNo {
  YES = 'Yes',
  NO = 'No',
}

export const enum Classification {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  RESTRICTED = 'RESTRICTED',
}

export const enum AdjournmentReasons {
  ADJOURNED_FACE_TO_FACE = 'Adjourned to face to face',
  ADJOURNED_TO_VIDEO = 'Adjourned to Video',
  ADMIN_ERROR = 'Admin error',
  APPELLANT_DID_NOT_ATTEND = 'Appellant did not attend',
  APPELLANT_DID_NOT_HAVE_BUNDLE = 'Appellant did not have bundle',
  APPELLANT_NOT_READY_TO_PROCEED = 'Appellant not ready to proceed',
  complex_case = 'Complex case',
  failure_to_comply_with_directions = 'Failure to comply with directions',
  FOR_LEGALE_REP_NO_SOL = 'For Legal Rep/No Sol',
  FOR_OTHER_PARTIES_TO_ATTEND = 'For Other Parties to Attend',
  FURTHER_EVIDENCE_RECEIVED_AT_COURT = 'Further evidence received at hearing',
  FURTHER_EVIDENCE_SUPPLIED_BUT_NOT_BEFORE_HEARING = 'Further evidence supplied but not before Tribunal at hearing',
  FURTHER_LOSS_OF_EARNINGS_INFORMATION_REQUIRED_APPELLANT = 'Further Loss of Earnings information required - Appellant',
  FURTHER_LOSS_OF_EARNINGS_INFORMATION_REQUIRED_RESPONDANT = 'Further Loss of Earnings information required - Respondent',
  FURTHER_MEDICAL_EVIDENCE_REQUIRED_APPELLANT = 'Further medical evidence required - Appellant',
  FURTHER_MEDICAL_EVIDENCE_REQUIRED_RESPONDANT = 'Further medical evidence required - Respondent',
  FURTHER_POLICEL_EVIDENCE_REQUIRED_RESPONDANT = 'Further police evidence required - Respondent',
  FURTHER_POLICEL_EVIDENCE_REQUIRED_APPELLANT = 'Further police evidence required - Appellant',
  FURTHER_POLICEL_EVIDENCE_REQUIRED_HMCTS_SUMMONS = 'Further police evidence required - HMCTS (Summons)',
  INSUFFICIENT_TIME = 'Insufficient time',
  INTERPRETER_REQUIRED = 'Interpreter required',
  MEMBER_UNABLE_TO_ATTEND = 'Member Unable to Attend',
  PO_DID_NOT_ATTEND = 'PO did not attend',
  POOR_EVIDENCE = 'Poor Evidence',
  VENUE_NOT_SUITABLE = 'Venue not suitable',
  WITNESS_DID_NOT_ATTEND = 'Witness did not attend',
  OTHER = 'Other',
}

export const enum ApplicantCIC {
  APPLICANT_CIC = 'ApplicantCIC',
}

export const enum CaseCategory {
  ASSESSMENT = 'Assessment',
  ELIGIBILITY = 'Eligibility',
}

export const enum CaseSubcategory {
  FATAL = 'Fatal',
  MEDICAL_REOPENING = 'MedicalReOpening',
  MINOR = 'Minor',
  PARAGRAPH_26 = 'Paragraph26',
  SEXUAL_ABUSE = 'sexualAbuse',
  SPECIAL_JURISDICTION = 'SpecialJurisdiction',
  OTHER = 'other',
}

export const enum ContactPartiesCIC {
  SUBJECTTOCONTACT = 'SubjectToContact',
  RESPONDENTTOCONTACT = 'RespondentToContact',
  REPRESENTATIVETOCONTACT = 'RepresentativeToContact',
}

export const enum ContactPreferencePartiesCIC {
  SUBJECT = 'SubjectCIC',
  REPRESENTATIVE = 'RepresentativeCIC',
  APPLICANT = 'ApplicantCIC',
}

export const enum ContactPreferenceType {
  EMAIL = 'Email',
  POST = 'Post',
}

export const enum DecisionTemplate {
  ELIGIBILITY = 'CIC1 - Eligibility',
  QUANTUM = 'CIC2 - Quantum',
  RULE_27 = 'CIC3 - Rule 27',
  BLANK_DECISION_NOTICE = 'CIC4 - Blank Decision Notice',
  GENERAL_DIRECTIONS = 'CIC6 - General Directions',
  ME_DMI_REPORTS = 'CIC7 - ME Dmi Reports',
  ME_JOINT_INSTRUCTION = 'CIC8 - ME Joint Instructions',
  STRIKE_OUT_WARNING = 'CIC10 - Strike Out Warning',
  STRIKE_OUT_DECISION_NOTICE = 'CIC11 - Strike Out Decision Notice',
  PRO_FORMA_SUMMONS = 'CIC13 - Pro Forma Summons',
}

export const enum FullPanelHearing {
  NO = "No. It was a 'sit alone' hearing",
  YES = 'Yes',
}

export const enum GetAmendDateAsCompleted {
  MARKASCOMPLETED = 'Mark as completed',
}

export const enum HearingAttendeesRole {
  APPELLANT = 'appellant',
  APPRAISER = 'appraiser',
  COUNSEL = 'Counsel',
  INTERPRETER = 'interpreter',
  LAY_MEMBER = 'layMember',
  MAIN_APPELLANT = 'mainAppellant',
  MEDICAL_MEMBER = 'medicalMember',
  OBSERVER = 'observer',
  PRESENTING_OFFICER = 'presentingOfficer',
  REPRESENTATIVE_LEGAL = 'representativeLegal',
  REPRESENTATIVE_NON_LEGAL = 'representativeNonLegal',
  TRIBUNAL_CLERK = 'Tribunal clerk',
  TRIBUNAL_JUDGE = 'Tribunal Judge',
  VICTIM = 'victim',
  WITNESS_GENERAL = 'Witness - General',
  WITNESS_POLICE = 'witnessPolice',
  OTHER = 'other',
}

export const enum HearingFormat {
  FACE_TO_FACE = 'Face to Face',
  HYBRID = 'Hybrid',
  VIDEO = 'Video',
  TELEPHONE = 'Telephone',
  PAPER = 'Paper',
}

export const enum HearingOutcome {
  ADJOURNED = 'Adjourned',
  ALLOWED = 'Allowed',
  REFUSED = 'Refused',
  WITHDRAWN_AT_HEARING = 'Withdrawn at Hearing',
}

export const enum HearingSession {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  ALL_DAY = 'allDay',
}

export const enum HearingState {
  Listed = 'Listed',
  Complete = 'Complete',
  Cancelled = 'Cancelled',
  Postponed = 'Postponed',
}

export const enum HearingSummaryHearingType {
  CASE_MANAGEMENT = 'CaseManagement',
  FINAL = 'Final',
  INTERLOCUTORY = 'Interlocutory',
}

export const enum HearingType {
  CASE_MANAGEMENT = 'CaseManagement',
  FINAL = 'Final',
  INTERLOCUTORY = 'Interlocutory',
}

export const enum LanguagePreference {
  ENGLISH = 'ENGLISH',
  WELSH = 'WELSH',
}

export const enum NotificationParties {
  SUBJECT = 'Subject',
  REPRESENTATIVE = 'Representative',
  APPLICANT = 'Applicant',
  RESPONDENT = 'Respondent',
}

export const enum NotificationType {
  EMAIL = 'Email',
  POST = 'Post',
}

export const enum OrderTemplate {
  CIC3_RULE_27 = 'CIC3_Rule_27',
  CIC6_GENERAL_DIRECTIONS = 'CIC6_General_Directions',
  CIC7_ME_DMI_REPORTS = 'CIC7_ME_Dmi_Reports',
  CIC8_ME_JOINT_INSTRUCTION = 'CIC8_ME_Joint_Instruction',
  CIC10_STRIKE_OUT_WARNING = 'CIC10_Strike_Out_Warning',
  CIC13_PRO_FORMA_SUMMONS = 'CIC13_Pro_Forma_Summons',
  CIC14_LO_GENERAL_DIRECTIONS = 'CIC14_LO_General_Directions',
}

export const enum PanelComposition {
  PANEL_1 = 'Panel 1',
  PANEL_2 = 'Panel 2',
  PANEL_3 = 'Panel 3',
}

export const enum PanelMembersRole {
  FULL_MEMBER = 'fullMember',
  OBSERVER = 'observer',
  APPRAISER = 'appraiser',
}

export const enum PartiesCIC {
  SUBJECT = 'SubjectCIC',
  REPRESENTATIVE = 'RepresentativeCIC',
  APPLICANT = 'ApplicantCIC',
}

export const enum RegionCIC {
  SCOTLAND = 'Scotland',
  LONDON = 'London',
  MIDLANDS = 'Midlands',
  NORTH_EAST = 'North East',
  NORTH_WEST = 'North West',
  WALES_AND_SOUTH_WEST = 'Wales & South West',
}

export const enum RepresentativeCIC {
  REPRESENTATIVE = 'RepresentativeCIC',
}

export const enum RepresentativeLegalQualification {
  EMAIL = 'Qualified',
  POST = 'POST',
}

export const enum RespondentCIC {
  RESPONDENT = 'RespondentCIC',
}

export const enum SchemeCic {
  Year1996 = 'Preference',
  Year2001 = 'Year2001',
  Year2008 = 'Year2008',
  Year2012 = 'Year2012',
}

export const enum SecondPanelMember {
  TRIBUNAL_JUDGE = 'Tribunal Judge',
  MEDICAL_MEMBER = 'Medical Member',
  LAY_MEMBER = 'Lay Member',
}

export const enum State {
  Completed = 'Completed',
  Rejected = 'Rejected',
  Sent = 'Sent',
  Withdrawn = 'Withdrawn',
  AwaitingHearing = 'AwaitingHearing',
  AwaitingOutcome = 'AwaitingOutcome',
  CaseClosed = 'CaseClosed',
  Concession = 'Concession',
  CaseManagement = 'CaseManagement',
  CaseStayed = 'CaseStayed',
  StrikeOut = 'StrikeOut',
  ConsentOrder = 'ConsentOrder',
  DeathOfAppellant = 'DeathOfAppellant',
  Draft = 'Draft',
  DSS_Draft = 'DSS_Draft',
  DSS_Expired = 'DSS_Expired',
  DSS_Submitted = 'DSS_Submitted',
  NewCaseReceived = 'NewCaseReceived',
  ReadyToList = 'ReadyToList',
  Rule27 = 'Rule27',
  Submitted = 'Submitted',
}

export const enum SubjectCIC {
  SUBJECT = 'SubjectCIC',
}

export const enum ThirdPanelMember {
  MEDICAL_MEMBER = 'Medical Member',
  LAY_MEMBER = 'Lay Member',
}

export const enum TribunalCIC {
  TRIBUNAL = 'TribunalCIC',
}

export const enum UserRole {
  SUPER_USER = 'caseworker-sptribs-superuser',
  SYSTEM_UPDATE = 'caseworker-sptribs-systemupdate',
  CASEWORKER = 'caseworker',
  CREATOR = '[CREATOR]',
  DISTRICT_JUDGE_CIC = 'caseworker-sptribs-cic-districtjudge',
  RESPONDENT_CIC = 'caseworker-sptribs-cic-respondent',
  ST_CIC_CASEWORKER = 'caseworker-st_cic-caseworker',
  ST_CIC_SENIOR_CASEWORKER = 'caseworker-st_cic-senior-caseworker',
  ST_CIC_HEARING_CENTRE_ADMIN = 'caseworker-st_cic-hearing-centre-admin',
  ST_CIC_HEARING_CENTRE_TEAM_LEADER = 'caseworker-st_cic-hearing-centre-team-leader',
  ST_CIC_SENIOR_JUDGE = 'caseworker-st_cic-senior-judge',
  ST_CIC_JUDGE = 'caseworker-st_cic-judge',
  ST_CIC_RESPONDENT = 'caseworker-st_cic-respondent',
  AC_CASE_FLAGS_ADMIN = 'caseflags-admin',
  AC_CASE_FLAGS_VIEWER = 'caseflags-viewer',
  CITIZEN = 'citizen',
  GS_PROFILE = 'GS_profile',
  ST_CIC_WA_CONFIG_USER = 'caseworker-wa-task-configuration',
  RAS_CASEWORKER_VALIDATION = 'caseworker-ras-validation',
}

export const enum UserRoleCS {
  COURT_ADMIN = 'caseworker-sptribs-cs-courtadmin',
  CASE_OFFICER = 'caseworker-sptribs-cs-caseofficer',
  DISTRICT_REGISTRAR = 'caseworker-sptribs-cs-districtregistrar',
  DISTRICT_JUDGE = 'caseworker-sptribs-cs-districtjudge',
  CITIZEN = 'citizen-sptribs-cs-dss',
}

export const enum UserRoleMH {
  COURT_ADMIN = 'caseworker-sptribs-mh-courtadmin',
  CASE_OFFICER = 'caseworker-sptribs-mh-caseofficer',
  DISTRICT_REGISTRAR = 'caseworker-sptribs-mh-districtregistrar',
  DISTRICT_JUDGE = 'caseworker-sptribs-mh-districtjudge',
  CITIZEN = 'citizen-sptribs-mh-dss',
}

export const enum UserRolePHL {
  COURT_ADMIN = 'caseworker-sptribs-phl-courtadmin',
  CASE_OFFICER = 'caseworker-sptribs-phl-caseofficer',
  DISTRICT_REGISTRAR = 'caseworker-sptribs-phl-districtregistrar',
  DISTRICT_JUDGE = 'caseworker-sptribs-phl-districtjudge',
  CITIZEN = 'citizen-sptribs-phl-dss',
}

export const enum UserRoleSEND {
  COURT_ADMIN = 'caseworker-sptribs-send-courtadmin',
  CASE_OFFICER = 'caseworker-sptribs-send-caseofficer',
  DISTRICT_REGISTRAR = 'caseworker-sptribs-send-districtregistrar',
  DISTRICT_JUDGE = 'caseworker-sptribs-send-districtjudge',
  CITIZEN = 'citizen-sptribs-send-dss',
  COURT_ADMIN_ASST = 'caseworker-sptribs-send-courtadminasst',
}

export const enum UserRolesForAccessProfiles {
  CREATOR = '[CREATOR]',
  SUPER_USER = 'idam:caseworker-sptribs-superuser',
  SYSTEMUPDATE = 'idam:caseworker-sptribs-systemupdate',
  CASEWORKER = 'idam:caseworker',
  ST_CIC_CASEWORKER = 'idam:caseworker-st_cic-caseworker',
  ST_CIC_SENIOR_CASEWORKER = 'idam:caseworker-st_cic-senior-caseworker',
  ST_CIC_HEARING_CENTRE_ADMIN = 'idam:caseworker-st_cic-hearing-centre-admin',
  ST_CIC_HEARING_CENTRE_TEAM_LEADER = 'idam:caseworker-st_cic-hearing-centre-team-leader',
  ST_CIC_SENIOR_JUDGE = 'idam:caseworker-st_cic-senior-judge',
  ST_CIC_JUDGE = 'idam:caseworker-st_cic-judge',
  ST_CIC_RESPONDENT = 'idam:caseworker-st_cic-respondent',
  CITIZEN_CIC = 'idam:citizen',
  IDAM_RAS_CASEWORKER_VALIDATION = 'idam:caseworker-ras-validation',
  CIC_SUPER_USER = 'caseworker-sptribs-superuser',
  AC_SYSTEMUPDATE = 'caseworker-sptribs-systemupdate',
  CIC_CASEWORKER = 'caseworker-st_cic-caseworker',
  CIC_SENIOR_CASEWORKER = 'caseworker-st_cic-senior-caseworker',
  CIC_CENTRE_ADMIN = 'caseworker-st_cic-hearing-centre-admin',
  CIC_CENTRE_TEAM_LEADER = 'caseworker-st_cic-hearing-centre-team-leader',
  CIC_SENIOR_JUDGE = 'caseworker-st_cic-senior-judge',
  CIC_JUDGE = 'caseworker-st_cic-judge',
  CIC_RESPONDENT = 'caseworker-st_cic-respondent',
  AC_CASEWORKER = 'caseworker',
  AC_CITIZEN = 'citizen',
  AC_CASEFLAGS_ADMIN = 'caseflags-admin',
  AC_CASEFLAGS_VIEWER = 'caseflags-viewer',
  GS_PROFILE = 'GS_profile',
  ST_CIC_WA_CONFIG_USER = 'idam:caseworker-wa-task-configuration',
  AC_ST_CIC_WA_CONFIG_USER = 'caseworker-wa-task-configuration',
  RAS_HMCTS_STAFF = 'hmcts-staff',
  RAS_HMCTS_CTSC = 'hmcts-ctsc',
  RAS_HMCTS_LEGAL_OPERATIONS = 'hmcts-legal-operations',
  RAS_HMCTS_ADMIN = 'hmcts-admin',
  RAS_HMCTS_JUDICIARY = 'hmcts-judiciary',
  RAS_ST_SENIOR_TRIBUNAL_CASEWORKER = 'senior-tribunal-caseworker',
  RAS_ST_TRIBUNAL_CASEWORKER = 'tribunal-caseworker',
  RAS_ST_HEARING_CENTRE_TEAM_LEADER = 'hearing-centre-team-leader',
  RAS_ST_HEARING_CENTRE_ADMIN = 'hearing-centre-admin',
  RAS_ST_REGIONAL_CENTRE_TEAM_LEADER = 'regional-centre-team-leader',
  RAS_ST_REGIONAL_CENTRE_ADMIN = 'regional-centre-admin',
  RAS_ST_CICA = 'cica',
  RAS_ST_CTSC_TEAM_LEADER = 'ctsc-team-leader',
  RAS_ST_CTSC = 'ctsc',
  RAS_ST_CASE_ALLOCATOR = 'case-allocator',
  RAS_ST_TASK_SUPERVISOR = 'task-supervisor',
  RAS_ST_SPECIFIC_ACCESS_APPROVER_LEGAL_OPS = 'specific-access-approver-legal-ops',
  RAS_ST_SPECIFIC_ACCESS_APPROVER_ADMIN = 'specific-access-approver-admin',
  RAS_ST_SPECIFIC_ACCESS_APPROVER_CTSC = 'specific-access-approver-ctsc',
  RAS_ST_SPECIFIC_ACCESS_APPROVER_JUDICIARY = 'specific-access-approver-judiciary',
  RAS_ST_SPECIFIC_ACCESS_LEGAL_OPS = 'specific-access-legal-ops',
  RAS_ST_SPECIFIC_ACCESS_ADMIN = 'specific-access-admin',
  RAS_ST_SPECIFIC_ACCESS_CTSC = 'specific-access-ctsc',
  RAS_ST_SPECIFIC_ACCESS_JUDICIARY = 'specific-access-judiciary',
  RAS_ST_JUDGE = 'judge',
  RAS_ST_SENIOR_JUDGE = 'senior-judge',
  RAS_ST_LEADERSHIP_JUDGE = 'leadership-judge',
  RAS_ST_FEE_PAID_JUDGE = 'fee-paid-judge',
  RAS_ST_FEE_PAID_TRIBUNAL_MEMBER = 'fee-paid-tribunal-member',
  RAS_ST_MEDICAL = 'medical',
  RAS_ST_FEE_PAID_MEDICAL = 'fee-paid-medical',
  RAS_ST_FEE_PAID_DISABILITY = 'fee-paid-disability',
  RAS_ST_FEE_PAID_FINANCIAL = 'fee-paid-financial',
  RAS_ST_ALLOCATED_JUDGE = 'allocated-judge',
  RAS_ST_INTERLOC_JUDGE = 'interloc-judge',
  RAS_ST_TRIBUNAL_MEMBER1 = 'tribunal-member-1',
  RAS_ST_TRIBUNAL_MEMBER2 = 'tribunal-member-2',
  RAS_ST_TRIBUNAL_MEMBER3 = 'tribunal-member-3',
  RAS_ST_APPRAISER1 = 'appraiser-1',
  RAS_ST_APPRAISER2 = 'appraiser-2',
  RAS_CASEWORKER_VALIDATION = 'caseworker-ras-validation',
}

export const enum VenueNotListed {
  VENUE_NOT_LISTED = 'VenueNotListed',
}

export const enum BundlePaginationStyle {
  off = 'off',
  topLeft = 'topLeft',
  topCenter = 'topCenter',
  topRight = 'topRight',
  bottomLeft = 'bottomLeft',
  bottomCenter = 'bottomCenter',
  bottomRight = 'bottomRight',
}

export const enum ConfidentialDocumentsReceived {
  AOS = 'aos',
  ANNEX_A = 'annexa',
  AOS_INVITATION_LETTER_OFFLINE_RESP = 'aosInvitationLetterOfflineResp',
  APPLICATION = 'application',
  BAILIFF_SERVICE = 'bailiffService',
  COE = 'coe',
  CO_ANSWERS = 'coAnswers',
  CONDITIONAL_ORDER_APPLICATION = 'conditionalOrderApplication',
  CONDITIONAL_ORDER_GRANTED = 'conditionalOrderGranted',
  CO_REFUSAL_CLARIFICATION_RESP = 'coRefusalClarificationResp',
  CORRESPONDENCE = 'correspondence',
  COSTS = 'costs',
  COSTS_ORDER = 'costsOrder',
  DEEMED_SERVICE = 'deemedService',
  DISPENSE_WITH_SERVICE = 'dispenseWithService',
  D84A = 'd84a',
  D9D = 'd9d',
  D9H = 'd9h',
  EMAIL = 'email',
  FINAL_ORDER_APPLICATION = 'finalOrderApplication',
  FINAL_ORDER_GRANTED = 'finalOrderGranted',
  GENERAL_LETTER = 'generalLetter',
  MARRIAGE_CERT = 'marriageCert',
  MARRIAGE_CERT_TRANSLATION = 'marriageCertTranslation',
  NAME_CHANGE = 'nameChange',
  NOTICE_OF_REFUSAL_OF_ENTITLEMENT = 'noticeOfRefusalOfEntitlement',
  OTHER = 'other',
  RESPONDENT_ANSWERS = 'respondentAnswers',
  SOLICITOR_SERVICE = 'solicitorService',
  WELSH_TRANSLATION = 'welshTranslation',
  NOTICE_OF_PROCEEDINGS_APP_1 = 'noticeOfProceedings',
  NOTICE_OF_PROCEEDINGS_APP_2 = 'noticeOfProceedingsApp2',
}

export const enum DocumentType {
  APPLICATION_FORM = 'ApplicationForm',
  FIRST_DECISION = 'First decision',
  APPLICATION_FOR_REVIEW = 'Application for review',
  REVIEW_DECISION = 'Review decision',
  NOTICE_OF_APPEAL = 'Notice of Appeal',
  EVIDENCE_CORRESPONDENCE_FROM_THE_APPELLANT = 'Evidence/correspondence from the Appellant',
  CORRESPONDENCE_FROM_THE_CICA = 'Correspondence from the CICA',
  TRIBUNAL_DIRECTION = 'Direction / decision notices',
  POLICE_EVIDENCE = 'PoliceEvidence',
  GP_RECORDS = 'GP records',
  HOSPITAL_RECORDS = 'Hospital records',
  MENTAL_HEALTH_RECORDS = 'Mental Health records',
  EXPERT_EVIDENCE = 'Expert evidence',
  OTHER_MEDICAL_RECORDS = 'Other medical records',
  DWP_RECORDS = 'DWP records',
  HMRC_RECORDS = 'HMRC records',
  EMPLOYMENT_RECORDS = 'Employment records',
  SCHEDULE_OF_LOSS = 'Schedule of Loss',
  COUNTER_SCHEDULE = 'Counter Schedule',
  OTHER_FINANCIAL = 'Other-D',
  CARE_PLAN = 'Care plan',
  LOCAL_AUTHORITY_CARE_RECORDS = 'Local Authority/care records',
  OTHER_EVIDENCE = 'Other-E',
  LINKED_DOCS = 'Linked docs',
  WITNESS_STATEMENT = 'Witness Statement',
  APPLICATION_FOR_AN_EXTENSION_OF_TIME = 'Application for an extension of time',
  APPLICATION_FOR_A_POSTPONEMENT = 'Application for a postponement',
  SUBMISSION_FROM_APPELLANT = 'Submission from appellant',
  SUBMISSION_FROM_RESPONDENT = 'Submission from respondent',
  OTHER_GENERAL_EVIDENCE = 'Other-TG',
  DSS_TRIBUNAL_FORM = 'DSS Tribunal form uploaded documents',
  DSS_SUPPORTING = 'DSS Supporting uploaded documents',
  DSS_OTHER = 'DSS Other information documents',
}

export const enum ImageRendering {
  opaque = 'opaque',
  translucent = 'translucent',
}

export const enum ImageRenderingLocation {
  allPages = 'allPages',
  firstPage = 'firstPage',
}

export const enum PageNumberFormat {
  numberOfPages = 'numberOfPages',
  pageRange = 'pageRange',
}

export const enum Event {
  SUBMIT = 'SUBMIT',
  UPDATE = 'UPDATE',
  UPDATE_CASE = 'UPDATE_CASE',
}

export const enum TemplateName {
  RESPONDENT_SOLICITOR_HAS_NOT_RESPONDED = 'RESPONDENT_SOLICITOR_HAS_NOT_RESPONDED',
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  APPLICATION_RECEIVED_CY = 'APPLICATION_RECEIVED_CY',
  APPLICATION_NEW_ORDER_ISSUED = 'APPLICATION_NEW_ORDER_ISSUED',
  CASE_CANCEL_HEARING_EMAIL = 'CASE_CANCEL_HEARING_EMAIL',
  CASE_CANCEL_HEARING_POST = 'CASE_CANCEL_HEARING_POST',
  CASE_REINSTATED_EMAIL = 'CASE_REINSTATED_EMAIL',
  CASE_REINSTATED_POST = 'CASE_REINSTATED_POST',
  DECISION_ISSUED_EMAIL = 'DECISION_ISSUED_EMAIL',
  DECISION_ISSUED_POST = 'DECISION_ISSUED_POST',
  CONTACT_PARTIES_EMAIL = 'CONTACT_PARTIES_EMAIL',
  CONTACT_PARTIES_POST = 'CONTACT_PARTIES_POST',
  CASE_UNLINKED_EMAIL = 'CASE_UNLINKED_EMAIL',
  CASE_UNLINKED_POST = 'CASE_UNLINKED_POST',
  CASE_STAYED_EMAIL = 'CASE_STAYED_EMAIL',
  CASE_STAYED_POST = 'CASE_STAYED_POST',
  CASE_UNSTAYED_EMAIL = 'CASE_UNSTAYED_EMAIL',
  CASE_UNSTAYED_POST = 'CASE_UNSTAYED_POST',
  TEST_TEMPLATE = 'TEST_TEMPLATE',
  CASE_ISSUED_CITIZEN_EMAIL = 'CASE_ISSUED_CITIZEN_EMAIL',
  CASE_ISSUED_CITIZEN_POST = 'CASE_ISSUED_CITIZEN_POST',
  CASE_ISSUED_RESPONDENT_EMAIL = 'CASE_ISSUED_RESPONDENT_EMAIL',
  LISTING_UPDATED_CITIZEN_EMAIL = 'LISTING_UPDATED_CITIZEN_EMAIL',
  LISTING_UPDATED_CITIZEN_POST = 'LISTING_UPDATED_CITIZEN_POST',
  LISTING_CREATED_CITIZEN_EMAIL = 'LISTING_CREATED_CITIZEN_EMAIL',
  LISTING_CREATED_CITIZEN_POST = 'LISTING_CREATED_CITIZEN_POST',
  CASE_FINAL_DECISION_ISSUED_EMAIL = 'CASE_FINAL_DECISION_ISSUED_EMAIL',
  CASE_FINAL_DECISION_ISSUED_POST = 'CASE_FINAL_DECISION_ISSUED_POST',
  HEARING_POSTPONED_EMAIL = 'HEARING_POSTPONED_EMAIL',
  HEARING_POSTPONED_POST = 'HEARING_POSTPONED_POST',
  CASE_WITHDRAWN_EMAIL = 'CASE_WITHDRAWN_EMAIL',
  CASE_WITHDRAWN_POST = 'CASE_WITHDRAWN_POST',
  NEW_ORDER_ISSUED_EMAIL = 'NEW_ORDER_ISSUED_EMAIL',
  NEW_ORDER_ISSUED_POST = 'NEW_ORDER_ISSUED_POST',
  CASE_LINKED_EMAIL = 'CASE_LINKED_EMAIL',
  CASE_LINKED_POST = 'CASE_LINKED_POST',
  UPDATE_RECEIVED_CITIZEN = 'UPDATE_RECEIVED_CITIZEN',
  UPDATE_RECEIVED_CASEWORKER = 'UPDATE_RECEIVED_CASEWORKER',
}

export const CITIZEN_CIC_CREATE_CASE = 'citizen-cic-create-dss-application';
export const CITIZEN_CIC_UPDATE_CASE = 'citizen-cic-update-dss-application';
export const CITIZEN_CIC_SUBMIT_CASE = 'citizen-cic-submit-dss-application';
export const CITIZEN_DSS_UPDATE_CASE_SUBMISSION = 'citizen-cic-dss-update-case';

// manually added
export const enum EmailAddress {
  EMAIL_ADDRESS = 'em',
}

export enum ContactPreference {
  ACCOUNT_OWNER = 'ACCOUNT_OWNER',
  NAMED_PERSON = 'NAMED_PERSON',
  BOTH_RECEIVE = 'BOTH_RECEIVE',
}

export const enum YesNoNotsure {
  YES = 'Yes',
  NO = 'No',
  NOT_SURE = 'NotSure',
}
