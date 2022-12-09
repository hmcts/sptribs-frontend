import { Sections, Step } from '../constants';
import {
  ADDITIONAL_DOCUMENTS_UPLOAD,
  APPLICATION_SUBMITTED,
  CHECK_YOUR_ANSWERS,
  CONTACT_PREFERENCES,
  COOKIES,
  DATE_OF_BIRTH,
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
    getNextStep: () => REPRESENTATION_QUALIFIED,
  },
  {
    url: REPRESENTATION_QUALIFIED,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => REPRESENTATIVES_DETAILS,
  },
  {
    url: REPRESENTATIVES_DETAILS,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => UPLOAD_APPEAL_FORM,
  },
  {
    url: UPLOAD_APPEAL_FORM,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => UPLOAD_SUPPORTING_DOCUMENTS,
  },
  {
    url: UPLOAD_SUPPORTING_DOCUMENTS,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => UPLOAD_OTHER_INFORMATION,
  },
  {
    url: UPLOAD_OTHER_INFORMATION,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => CHECK_YOUR_ANSWERS,
  },
  {
    url: CHECK_YOUR_ANSWERS,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => APPLICATION_SUBMITTED,
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
    url: CONTACT_PREFERENCES,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => ADDITIONAL_DOCUMENTS_UPLOAD,
  },
  {
    url: ADDITIONAL_DOCUMENTS_UPLOAD,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => CHECK_YOUR_ANSWERS,
  },
  {
    url: CHECK_YOUR_ANSWERS,
    showInSection: Sections.AboutEdgeCase,
    getNextStep: () => APPLICATION_SUBMITTED,
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
