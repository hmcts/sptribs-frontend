import {
  ADDITIONAL_DOCUMENTS_UPLOAD,
  APPLICATION_SUBMITTED,
  CHECK_YOUR_ANSWERS,
  CONTACT_PREFERENCES,
  COOKIES,
  DATE_OF_BIRTH,
  FIND_ADDRESS,
  MANUAL_ADDRESS,
  SELECT_ADDRESS,
  STATEMENT_OF_TRUTH,
  SUBJECT_CONTACT_DETAILS,
  SUBJECT_DETAILS,
  UPLOAD_YOUR_DOCUMENTS,
  USER_ROLE,
} from '../urls';

import { edgecaseSequence } from './edgecaseSequence';

describe('Sequence must match respective path', () => {
  test('must match the path', () => {
    expect(edgecaseSequence).toHaveLength(15);

    expect(edgecaseSequence[0].url).toBe(SUBJECT_DETAILS);
    expect(edgecaseSequence[0].getNextStep({})).toBe(SUBJECT_CONTACT_DETAILS);

    expect(edgecaseSequence[1].url).toBe(SUBJECT_CONTACT_DETAILS);
    expect(edgecaseSequence[1].getNextStep({})).toBe(USER_ROLE);

    expect(edgecaseSequence[2].url).toBe(USER_ROLE);
    expect(edgecaseSequence[2].getNextStep({})).toBe(DATE_OF_BIRTH);

    expect(edgecaseSequence[3].url).toBe(DATE_OF_BIRTH);
    expect(edgecaseSequence[3].getNextStep({})).toBe(FIND_ADDRESS);

    expect(edgecaseSequence[4].url).toBe(FIND_ADDRESS);
    expect(edgecaseSequence[4].getNextStep({})).toBe(SELECT_ADDRESS);

    expect(edgecaseSequence[5].url).toBe(SELECT_ADDRESS);
    expect(edgecaseSequence[5].getNextStep({})).toBe(CONTACT_PREFERENCES);

    expect(edgecaseSequence[6].url).toBe(MANUAL_ADDRESS);
    expect(edgecaseSequence[6].getNextStep({})).toBe(CONTACT_PREFERENCES);

    expect(edgecaseSequence[7].url).toBe(CONTACT_PREFERENCES);
    expect(edgecaseSequence[7].getNextStep({})).toBe(UPLOAD_YOUR_DOCUMENTS);

    expect(edgecaseSequence[8].url).toBe(UPLOAD_YOUR_DOCUMENTS);
    expect(edgecaseSequence[8].getNextStep({})).toBe(ADDITIONAL_DOCUMENTS_UPLOAD);

    expect(edgecaseSequence[9].url).toBe(ADDITIONAL_DOCUMENTS_UPLOAD);
    expect(edgecaseSequence[9].getNextStep({})).toBe(CHECK_YOUR_ANSWERS);

    expect(edgecaseSequence[10].url).toBe(CHECK_YOUR_ANSWERS);
    expect(edgecaseSequence[10].getNextStep({})).toBe(STATEMENT_OF_TRUTH);

    expect(edgecaseSequence[11].url).toBe(STATEMENT_OF_TRUTH);
    expect(edgecaseSequence[11].getNextStep({})).toBe(APPLICATION_SUBMITTED);

    expect(edgecaseSequence[12].url).toBe(APPLICATION_SUBMITTED);
    expect(edgecaseSequence[12].getNextStep({})).toBe(SUBJECT_DETAILS);

    expect(edgecaseSequence[13].url).toBe(SUBJECT_DETAILS);
    expect(edgecaseSequence[13].getNextStep({})).toBe(SUBJECT_CONTACT_DETAILS);

    expect(edgecaseSequence[14].url).toBe(COOKIES);
    expect(edgecaseSequence[14].getNextStep({})).toBe(SUBJECT_DETAILS);
  });
});
