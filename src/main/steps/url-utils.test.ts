import { signInNotRequired } from './url-utils';
import {
  ACCESSIBILITY_STATEMENT,
  CONTACT_US,
  COOKIES,
  PRIVACY_POLICY,
  PageLink,
  TERMS_AND_CONDITIONS,
  TIMED_OUT_URL,
  UPLOAD_SUPPORTING_DOCUMENTS,
} from './urls';

describe('url-utils', () => {
  describe('signInNotRequired', () => {
    it.each([
      [ACCESSIBILITY_STATEMENT, true],
      [CONTACT_US, true],
      [COOKIES, true],
      [PRIVACY_POLICY, true],
      [TERMS_AND_CONDITIONS, true],
      [TIMED_OUT_URL, true],
      [UPLOAD_SUPPORTING_DOCUMENTS, false],
    ])("when the input is '%s' signInNotRequired returns %s", (text: PageLink, expected: boolean) => {
      expect(signInNotRequired(text)).toBe(expected);
    });
  });
});
