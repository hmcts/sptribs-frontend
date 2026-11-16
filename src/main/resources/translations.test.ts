import fsSync from 'fs';
import fs from 'fs/promises';
import path from 'path';

const RESOURCES_DIR = __dirname;

const findTranslationFiles = (dir: string): string[] => {
  const entries = fsSync.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return findTranslationFiles(fullPath);
    }

    return entry.name === 'translation.json' ? [fullPath] : [];
  });
};

type Translations = { [key: string]: string | Translations };

/** Recursively checks that two sets of translations has the same keys. */
const haveSameKeys = (a: Translations, b: Translations): boolean => {
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) {
    return false;
  }

  return aKeys.every(k => {
    if (!(k in b)) {
      return false;
    }
    const av = a[k];
    const bv = b[k];
    if (typeof av === 'string' || typeof bv === 'string') {
      return typeof av === typeof bv;
    }
    return av !== null && bv !== null && haveSameKeys(av, bv);
  });
};

describe('translation.json files', () => {
  const translationFiles = findTranslationFiles(RESOURCES_DIR).map(filePath => path.relative(RESOURCES_DIR, filePath));

  test('should be at least one translation.json file found', () => {
    expect(translationFiles.length).toBeGreaterThan(0);
  });

  test.each(translationFiles)('should be valid JSON: %s', async filePath => {
    const raw = await fs.readFile(path.join(RESOURCES_DIR, filePath), 'utf-8');
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  test.each(translationFiles)('should have identical en and cy structure: %s', async filePath => {
    const raw = await fs.readFile(path.join(RESOURCES_DIR, filePath), 'utf-8');
    const json = JSON.parse(raw) as Record<string, unknown>;

    for (const topLevelKey of ['translations', 'errors']) {
      if (!(topLevelKey in json)) {
        continue;
      }
      const en = (json[topLevelKey] as Record<string, unknown>).en || {};
      const cy = (json[topLevelKey] as Record<string, unknown>).cy || {};
      expect(haveSameKeys(en as Translations, cy as Translations)).toBe(true);
    }
  });
});
