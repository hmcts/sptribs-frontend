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
  resourceLoader.Loader('postcode-error');

  const Translations = resourceLoader.getFileContents().translations;

  const en = () => {
    return {
      ...Translations.en,
    };
  };

  const cy = () => {
    return {
      ...Translations.cy,
    };
  };

  const languages = {
    en,
    cy,
  };

  const translations = languages[content.language] ? languages[content.language]() : languages['en']();

  return {
    ...translations,
    form,
  };
};
