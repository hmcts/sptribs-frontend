import {
  ADDITIONAL_DOCUMENTS_UPLOAD,
  APPLICATION_SUBMITTED,
  CHECK_YOUR_ANSWERS,
  CONTACT_PREFERENCES,
  COOKIES,
  DATE_OF_BIRTH,
  EQUALITY,
  FIND_ADDRESS,
  MANUAL_ADDRESS,
  REPRESENTATION,
  REPRESENTATION_QUALIFIED,
  REPRESENTATIVES_DETAILS,
  SELECT_ADDRESS,
  SUBJECT_CONTACT_DETAILS,
  SUBJECT_DETAILS,
  UPLOAD_APPEAL_FORM,
  UPLOAD_OTHER_INFORMATION,
  UPLOAD_SUPPORTING_DOCUMENTS,
  USER_ROLE,
} from '../urls';

import { edgecaseSequence } from './edgecaseSequence';

describe('Sequence must match respective path', () => {
  test('must match the path', () => {
    expect(edgecaseSequence).toHaveLength(21);

    expect(edgecaseSequence[0].url).toBe(SUBJECT_DETAILS);
    expect(edgecaseSequence[0].getNextStep({})).toBe(SUBJECT_CONTACT_DETAILS);

    expect(edgecaseSequence[1].url).toBe(SUBJECT_CONTACT_DETAILS);
    expect(edgecaseSequence[1].getNextStep({})).toBe(REPRESENTATION);

    expect(edgecaseSequence[2].url).toBe(REPRESENTATION);
    expect(edgecaseSequence[2].getNextStep({})).toBe(REPRESENTATION_QUALIFIED);

    expect(edgecaseSequence[3].url).toBe(REPRESENTATION_QUALIFIED);
    expect(edgecaseSequence[3].getNextStep({})).toBe(REPRESENTATIVES_DETAILS);

    expect(edgecaseSequence[4].url).toBe(REPRESENTATIVES_DETAILS);
    expect(edgecaseSequence[4].getNextStep({})).toBe(UPLOAD_APPEAL_FORM);

    expect(edgecaseSequence[5].url).toBe(UPLOAD_APPEAL_FORM);
    expect(edgecaseSequence[5].getNextStep({})).toBe(UPLOAD_SUPPORTING_DOCUMENTS);

    expect(edgecaseSequence[6].url).toBe(UPLOAD_SUPPORTING_DOCUMENTS);
    expect(edgecaseSequence[6].getNextStep({})).toBe(UPLOAD_OTHER_INFORMATION);

    expect(edgecaseSequence[7].url).toBe(UPLOAD_OTHER_INFORMATION);
    expect(edgecaseSequence[7].getNextStep({})).toBe(EQUALITY);

    expect(edgecaseSequence[8].url).toBe(EQUALITY);
    expect(edgecaseSequence[8].getNextStep({})).toBe(CHECK_YOUR_ANSWERS);

    expect(edgecaseSequence[9].url).toBe(CHECK_YOUR_ANSWERS);
    expect(edgecaseSequence[9].getNextStep({})).toBe(APPLICATION_SUBMITTED);

    expect(edgecaseSequence[10].url).toBe(USER_ROLE);
    expect(edgecaseSequence[10].getNextStep({})).toBe(DATE_OF_BIRTH);

    expect(edgecaseSequence[11].url).toBe(DATE_OF_BIRTH);
    expect(edgecaseSequence[11].getNextStep({})).toBe(FIND_ADDRESS);

    expect(edgecaseSequence[12].url).toBe(FIND_ADDRESS);
    expect(edgecaseSequence[12].getNextStep({})).toBe(SELECT_ADDRESS);

    expect(edgecaseSequence[13].url).toBe(SELECT_ADDRESS);
    expect(edgecaseSequence[13].getNextStep({})).toBe(CONTACT_PREFERENCES);

    expect(edgecaseSequence[14].url).toBe(MANUAL_ADDRESS);
    expect(edgecaseSequence[14].getNextStep({})).toBe(CONTACT_PREFERENCES);

    expect(edgecaseSequence[15].url).toBe(CONTACT_PREFERENCES);
    expect(edgecaseSequence[15].getNextStep({})).toBe(ADDITIONAL_DOCUMENTS_UPLOAD);

    expect(edgecaseSequence[16].url).toBe(ADDITIONAL_DOCUMENTS_UPLOAD);
    expect(edgecaseSequence[16].getNextStep({})).toBe(CHECK_YOUR_ANSWERS);

    expect(edgecaseSequence[17].url).toBe(CHECK_YOUR_ANSWERS);
    expect(edgecaseSequence[17].getNextStep({})).toBe(APPLICATION_SUBMITTED);

    expect(edgecaseSequence[18].url).toBe(APPLICATION_SUBMITTED);
    expect(edgecaseSequence[18].getNextStep({})).toBe(SUBJECT_DETAILS);

    expect(edgecaseSequence[19].url).toBe(SUBJECT_DETAILS);
    expect(edgecaseSequence[19].getNextStep({})).toBe(SUBJECT_CONTACT_DETAILS);

    expect(edgecaseSequence[20].url).toBe(COOKIES);
    expect(edgecaseSequence[20].getNextStep({})).toBe(SUBJECT_DETAILS);
  });
});
