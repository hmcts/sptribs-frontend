import { mockRequest } from '../../test/unit/utils/mockRequest';
import { Case } from '../app/case/case';
import { YesOrNo } from '../app/case/definition';

import {
  APPLICATION_SUBMITTED,
  CHECK_YOUR_ANSWERS,
  EQUALITY,
  REPRESENTATION,
  REPRESENTATION_QUALIFIED,
  SUBJECT_DETAILS,
} from './urls';

import { getNextCyaStepUrl, getNextStepUrl, isCyaCapable } from './index';

describe('getNextStepUrl', () => {
  test.each([
    {
      note: 'returns SUBJECT_DETAILS when saveAsDraft is selected',
      originalUrl: REPRESENTATION,
      body: { saveAsDraft: true },
      userCase: { representation: YesOrNo.YES },
      expected: SUBJECT_DETAILS,
    },
    {
      note: 'preserves query string when moving to next step',
      originalUrl: `${REPRESENTATION}?check-your-answers`,
      userCase: { representation: YesOrNo.YES },
      expected: `${REPRESENTATION_QUALIFIED}?check-your-answers`,
    },
    {
      note: 'falls back to SUBJECT_DETAILS for unknown path',
      originalUrl: '/not-a-real-step',
      expected: SUBJECT_DETAILS,
    },
  ])('$note', ({ originalUrl, body, userCase, expected }) => {
    const req = mockRequest({ body: body ?? {}, originalUrl, userCase: userCase ?? {} });
    expect(getNextStepUrl(req, (userCase ?? {}) as Case)).toBe(expected);
  });
});

describe('getNextCyaStepUrl', () => {
  test.each([
    {
      note: 'returns newly available page after changing representation to Yes',
      path: REPRESENTATION,
      userCase: { representation: YesOrNo.YES },
      expected: REPRESENTATION_QUALIFIED,
    },
    {
      note: 'returns CHECK_YOUR_ANSWERS from equality step in CYA flow',
      path: EQUALITY,
      expected: CHECK_YOUR_ANSWERS,
    },
  ])('$note', ({ path, userCase, expected }) => {
    const req = mockRequest({ userCase: userCase ?? {}, path });
    expect(getNextCyaStepUrl(req, (userCase ?? {}) as Case)).toBe(expected);
  });
});

describe('inCyaFlow', () => {
  test.each([
    {
      note: 'returns true for a CYA sequence page',
      path: REPRESENTATION,
      expected: true,
    },
    {
      note: "returns true for a CYA sequence page even if it's currently hidden",
      path: REPRESENTATION_QUALIFIED,
      userCase: { representation: YesOrNo.NO },
      expected: true,
    },
    {
      note: 'returns false for the CHECK_YOUR_ANSWERS page itself',
      path: CHECK_YOUR_ANSWERS,
      expected: false,
    },
    {
      note: 'returns false for application submitted page',
      path: APPLICATION_SUBMITTED,
      expected: false,
    },
    {
      note: 'returns false for unknown page',
      path: '/not-a-real-step',
      expected: false,
    },
  ])('$note', ({ path, userCase, expected }) => {
    const req = mockRequest({ userCase: userCase ?? {}, path });
    expect(isCyaCapable(path, req)).toBe(expected);
  });
});
