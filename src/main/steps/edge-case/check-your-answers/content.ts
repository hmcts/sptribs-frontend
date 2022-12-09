import { YesOrNo } from '../../../app/case/definition';
import { TranslationFn } from '../../../app/controller/GetController';
import { FormContent } from '../../../app/form/Form';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import { CommonContent } from '../../../steps/common/common.content';

import {
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
};

const en = (content: any) => {
  const userCase = content.userCase!;
  const caseAppealDocuments = content.uploadedDocuments;
  const supportingDocuments = content.supportingDocuments;

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
          ]
        : [
            SubjectSummaryList(enContent, userCase),
            RepresentationSummary(enContent, userCase),
            UploadAppealFormSummary(enContent, caseAppealDocuments),
            SupportingDocumentsSummary(enContent, supportingDocuments),
          ],
  };
};

const cyContent: typeof enContent = {
  ...Translations.cy,
};

const cy: typeof en = (content: CommonContent) => {
  const userCase = content.userCase!;
  const caseAppealDocuments = content.uploadedDocuments;
  const supportingDocuments = content.supportingDocuments;

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
          ]
        : [
            SubjectSummaryList(cyContent, userCase),
            RepresentationSummary(cyContent, userCase),
            UploadAppealFormSummary(cyContent, caseAppealDocuments),
            SupportingDocumentsSummary(cyContent, supportingDocuments),
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
