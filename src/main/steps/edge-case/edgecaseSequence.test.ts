import { YesOrNo } from '../../app/case/definition';
import {
  APPLICATION_SUBMITTED,
  CHECK_YOUR_ANSWERS,
  CICA_DECISION_DATE,
  CICA_REFERENCE_NUMBER,
  EQUALITY,
  REPRESENTATION,
  REPRESENTATION_QUALIFIED,
  REPRESENTATIVES_DETAILS,
  SUBJECT_CONTACT_DETAILS,
  SUBJECT_DETAILS,
  UPLOAD_APPEAL_FORM,
  UPLOAD_OTHER_INFORMATION,
  UPLOAD_SUPPORTING_DOCUMENTS,
} from '../urls';

import { edgecaseSequence } from './edgecaseSequence';

describe('edgecaseSequence', () => {
  test.each([
    { note: 'with representative', representation: YesOrNo.YES },
    { note: 'without representative', representation: YesOrNo.NO },
  ])('follows the expected sequence: $note', ({ representation }) => {
    const expectedSequence = [
      SUBJECT_DETAILS,
      SUBJECT_CONTACT_DETAILS,
      REPRESENTATION,
      ...(representation === YesOrNo.YES ? [REPRESENTATION_QUALIFIED, REPRESENTATIVES_DETAILS] : []),
      CICA_REFERENCE_NUMBER,
      CICA_DECISION_DATE,
      UPLOAD_APPEAL_FORM,
      UPLOAD_SUPPORTING_DOCUMENTS,
      UPLOAD_OTHER_INFORMATION,
      EQUALITY,
      CHECK_YOUR_ANSWERS,
      APPLICATION_SUBMITTED,
      SUBJECT_DETAILS,
    ];

    const actualSequence: string[] = [SUBJECT_DETAILS];
    // Follow the sequence until we reach a duplicate step
    while (new Set(actualSequence).size === actualSequence.length) {
      const currentStep = edgecaseSequence.find(s => s.url === actualSequence[actualSequence.length - 1])!;
      actualSequence.push(currentStep.getNextStep({ representation }));
    }

    expect(actualSequence).toEqual(expectedSequence);
  });
});
