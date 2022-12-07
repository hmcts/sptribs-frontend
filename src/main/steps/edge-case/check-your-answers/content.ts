import { YesOrNo } from '../../../app/case/definition';
import { TranslationFn } from '../../../app/controller/GetController';
import { FormContent } from '../../../app/form/Form';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import { CommonContent } from '../../../steps/common/common.content';

import {
  AdditonalFormSummary,
  RepresentationSummary,
  RepresentativeSummaryList,
  SubjectSummaryList,
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
  const caseDocuments = content.uploadedDocuments;
  //const AdditionalDocuments = content.AddDocuments;

  return {
    ...enContent,
    language: content.language,
    sections:
      userCase['representation'] === YesOrNo.YES
        ? [
            SubjectSummaryList(enContent, userCase),
            RepresentationSummary(enContent, userCase),
            RepresentativeSummaryList(enContent, userCase),
            UploadAppealFormSummary(enContent, caseDocuments),
            //AdditonalFormSummary(enContent, AdditionalDocuments),
          ]
        : [
            SubjectSummaryList(enContent, userCase),
            RepresentationSummary(enContent, userCase),
            UploadAppealFormSummary(enContent, caseDocuments),
          ],
  };
};

const cyContent: typeof enContent = {
  ...Translations.cy,
};

const cy: typeof en = (content: CommonContent) => {
  const userCase = content.userCase!;
  const caseDocuments = content.uploadedDocuments;
  const AdditionalDocuments = content['AddDocuments'];

  return {
    ...cyContent,
    language: content.language,
    sections: [
      SubjectSummaryList(cyContent, userCase),
      UploadAppealFormSummary(enContent, caseDocuments),
      AdditonalFormSummary(enContent, AdditionalDocuments),
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
