import { TranslationFn } from '../../app/controller/GetController';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';

const DASHBOARD_TRANSLATION_FILE = 'dashboard';

export const generateContent: TranslationFn = content => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader(DASHBOARD_TRANSLATION_FILE);
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

  const translations = languages[content.language]();
  return {
    ...translations,
  };
};
