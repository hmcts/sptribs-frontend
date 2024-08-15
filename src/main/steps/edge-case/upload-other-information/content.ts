import { TranslationFn } from '../../../app/controller/GetController';
import { FormContent } from '../../../app/form/Form';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';

export const form: FormContent = {
  fields: {
    documentUploadProceed: {
      type: 'hidden',
      label: l => l.uploadFiles,
      labelHidden: true,
      value: 'true',
    },
  },
};

export const generateContent: TranslationFn = content => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('upload-other-information');
  const Translations = resourceLoader.getFileContents().translations;
  const errors = resourceLoader.getFileContents().errors;

  const en = () => {
    return {
      ...Translations.en,
      errors: {
        ...errors.en,
      },
    };
  };
  const cy = () => {
    return {
      ...Translations.cy,
      errors: {
        ...errors.cy,
      },
    };
  };

  const languages = {
    en,
    cy,
  };
  const translations = languages[content.language]();

  return {
    ...translations,
    form,
  };
};
