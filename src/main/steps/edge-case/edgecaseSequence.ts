import { YesOrNo } from '../../app/case/definition';
import { Sections, Step } from '../constants';
import {
  APPLICATION_SUBMITTED,
  CHECK_YOUR_ANSWERS,
  CICA_DECISION_DATE,
  CICA_REFERENCE_NUMBER,
  CONTACT_PREFERENCES,
  COOKIES,
  DATE_OF_BIRTH,
  EQUALITY,
  FIND_ADDRESS,
  MANUAL_ADDRESS,
  REPRESENTATION,
  REPRESENTATION_QUALIFIED,
  REPRESENTATIVES_DETAILS,
  SELECT_ADDRESS,
  SUBJECT_CONTACT_DETAILS,
  SUBJECT_DETAILS,
  UPLOAD_APPEAL_FORM,
  UPLOAD_OTHER_INFORMATION,
  UPLOAD_SUPPORTING_DOCUMENTS,
  USER_ROLE,
} from '../urls';

export const edgecaseSequence: Step[] = [
  {
    url: SUBJECT_DETAILS,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => SUBJECT_CONTACT_DETAILS,
  },
  {
    url: SUBJECT_CONTACT_DETAILS,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => REPRESENTATION,
  },
  {
    url: REPRESENTATION,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: caseData =>
      caseData.representation === YesOrNo.YES ? REPRESENTATION_QUALIFIED : CICA_REFERENCE_NUMBER,
  },
  {
    url: REPRESENTATION_QUALIFIED,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => REPRESENTATIVES_DETAILS,
  },
  {
    url: REPRESENTATIVES_DETAILS,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => CICA_REFERENCE_NUMBER,
  },
  {
    url: CICA_REFERENCE_NUMBER,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => CICA_DECISION_DATE,
  },
  {
    url: CICA_DECISION_DATE,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => UPLOAD_APPEAL_FORM,
  },
  {
    url: UPLOAD_APPEAL_FORM,
    showInSection: Sections.AboutEdgeCase,
    isComplete: session => session.caseDocuments?.length > 0,
    getNextStep: () => UPLOAD_SUPPORTING_DOCUMENTS,
  },
  {
    url: UPLOAD_SUPPORTING_DOCUMENTS,
    showInSection: Sections.AboutEdgeCase,
    isComplete: session => session.supportingCaseDocuments?.length > 0,
    getNextStep: () => UPLOAD_OTHER_INFORMATION,
  },
  {
    url: UPLOAD_OTHER_INFORMATION,
    showInSection: Sections.AboutEdgeCase,
    // This step is always considered complete, as it is optional and has no form fields
    // Also, it is always part of the sequence. Therefore, if we're in the Check Your Answers flow,
    // the user has already seen this step, so don't visit it again.
    isComplete: () => true,
    getNextStep: () => EQUALITY,
  },
  {
    url: EQUALITY,
    showInSection: Sections.AboutEdgeCase,
    // If we're in Check Your Answers flow, the user has already seen this step, so don't visit it again.
    isComplete: () => true,
    getNextStep: () => CHECK_YOUR_ANSWERS,
  },
  {
    url: USER_ROLE,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => DATE_OF_BIRTH,
  },
  {
    url: DATE_OF_BIRTH,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => FIND_ADDRESS,
  },
  {
    url: FIND_ADDRESS,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => SELECT_ADDRESS,
  },
  {
    url: SELECT_ADDRESS,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => CONTACT_PREFERENCES,
  },
  {
    url: MANUAL_ADDRESS,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => CONTACT_PREFERENCES,
  },
  {
    url: CHECK_YOUR_ANSWERS,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => APPLICATION_SUBMITTED,
    // This step never counts as complete
    isComplete: () => false,
  },
  {
    url: APPLICATION_SUBMITTED,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => SUBJECT_DETAILS,
  },
  {
    url: SUBJECT_DETAILS,
    getNextStep: () => SUBJECT_CONTACT_DETAILS,
  },
  {
    url: COOKIES,
    getNextStep: () => SUBJECT_DETAILS,
  },
];
