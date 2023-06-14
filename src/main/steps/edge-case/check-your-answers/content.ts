import { YesOrNo } from '../../../app/case/definition';
import { TranslationFn } from '../../../app/controller/GetController';
import { FormContent } from '../../../app/form/Form';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import { CommonContent } from '../../../steps/common/common.content';

import {
  OtherInformationSummary,
  RepresentationSummary,
  RepresentativeSummaryList,
  SubjectSummaryList,
  SupportingDocumentsSummary,
  UploadAppealFormSummary,
} from './utils';
const resourceLoader = new ResourceReader();
resourceLoader.Loader('check-your-answers');
const Translations = resourceLoader.getFileContents().translations;
export const enContent = {
  ...Translations.en,
  nowSubmitHeader: 'Now submit your tribunal form',
  submissionPledge:
    'By submitting this tribunal form you are confirming that, to the best of your knowledge, the details you are providing are correct.',
};

export const en = (content: any) => {
  const userCase = content.userCase!;
  const caseAppealDocuments = content.uploadedDocuments;
  const supportingDocuments = content.supportingDocuments;
  const otherInformation = content.otherInformation;

  return {
    ...enContent,
    language: content.language,
    sections:
      userCase['representation'] === YesOrNo.YES
        ? [
            SubjectSummaryList(enContent, userCase),
            RepresentationSummary(enContent, userCase),
            RepresentativeSummaryList(enContent, userCase),
            UploadAppealFormSummary(enContent, caseAppealDocuments),
            SupportingDocumentsSummary(enContent, supportingDocuments),
            OtherInformationSummary(enContent, otherInformation, userCase),
          ]
        : [
            SubjectSummaryList(enContent, userCase),
            RepresentationSummary(enContent, userCase),
            UploadAppealFormSummary(enContent, caseAppealDocuments),
            SupportingDocumentsSummary(enContent, supportingDocuments),
            OtherInformationSummary(enContent, otherInformation, userCase),
          ],
  };
};

const cyContent: typeof enContent = {
  ...Translations.cy,
  nowSubmitHeader: 'Now submit your tribunal form - in welsh',
  submissionPledge:
    'By submitting this tribunal form you are confirming that, to the best of your knowledge, the details you are providing are correct. - in welsh',
};

const cy: typeof en = (content: CommonContent) => {
  const userCase = content.userCase!;
  const caseAppealDocuments = content.uploadedDocuments;
  const supportingDocuments = content.supportingDocuments;
  const otherInformation = content.otherInformation;

  return {
    ...cyContent,
    language: content.language,
    sections:
      userCase['representation'] === YesOrNo.YES
        ? [
            SubjectSummaryList(cyContent, userCase),
            RepresentationSummary(cyContent, userCase),
            RepresentativeSummaryList(cyContent, userCase),
            UploadAppealFormSummary(cyContent, caseAppealDocuments),
            SupportingDocumentsSummary(cyContent, supportingDocuments),
            OtherInformationSummary(cyContent, otherInformation, userCase),
          ]
        : [
            SubjectSummaryList(cyContent, userCase),
            RepresentationSummary(cyContent, userCase),
            UploadAppealFormSummary(cyContent, caseAppealDocuments),
            SupportingDocumentsSummary(cyContent, supportingDocuments),
            OtherInformationSummary(cyContent, otherInformation, userCase),
          ],
  };
};

export const form: FormContent = {
  fields: {},
  submit: {
    text: l => l.continue,
  },
};

const languages = {
  en,
  cy,
};

export const generateContent: TranslationFn = content => {
  const translations = languages[content.language](content);
  return {
    ...translations,
    form,
  };
};
