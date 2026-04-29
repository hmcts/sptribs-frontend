import { TranslationFn } from '../../app/controller/GetController';
import { FormContent } from '../../app/form/Form';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';

export const form: FormContent = {
  fields: {},
  submit: {
    text: l => l.continue,
  },
};

export const generateContent: TranslationFn = content => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('ccd-not-authorised');

  const Translations = resourceLoader.getFileContents().translations;

  const ccdReference = content.userCase?.ccdReferenceNumber || '';

  const en = () => {
    return {
      ...Translations.en,
      reference: ccdReference,
    };
  };

  const cy = () => {
    return {
      ...Translations.cy,
      reference: ccdReference,
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
