const v4Mock = jest.fn().mockReturnValue('MOCK_V4_UUID');
jest.mock('uuid', () => ({
  v4: v4Mock,
}));

import { Case } from './case';
import { toApiFormat } from './to-api-format';

describe('to-api-format', () => {
  test('handles invalid data correctly', async () => {
    const apiFormat = toApiFormat({
      applicant1HelpWithFeesRefNo: '123-ABC',
    } as Partial<Case>);

    expect(apiFormat).not.toMatchObject({
      applicant1HWFReferenceNumber: '123-ABC',
    });
  });
});

test('if initialCicaDecisionDate is populated then cicCaseInitialCicaDecisionDate should be returned with a formatted date', async () => {
  const cicCaseInitialCicaDecisionDateFormat = toApiFormat({
    initialCicaDecisionDate: { day: '20', month: '1', year: '2000' },
  });
  expect(cicCaseInitialCicaDecisionDateFormat.cicCaseInitialCicaDecisionDate).toBe('2000-01-20');
});

test('if initialCicaDecisionDate is not populated then cicCaseInitialCicaDecisionDate should be blank', async () => {
  const cicCaseInitialCicaDecisionDateFormat = toApiFormat({
    initialCicaDecisionDate: { day: '', month: '1', year: '2000' },
  });
  expect(cicCaseInitialCicaDecisionDateFormat.cicCaseInitialCicaDecisionDate).toBe('');
});

test('if cicaReferenceNumber is populated then editCicaCaseDetails.cicaReferenceNumber should be returned with the same value', async () => {
  const editCicaCaseDetailsFormat = toApiFormat({ cicaReferenceNumber: 'X/12/123456-TM1A' });
  expect(editCicaCaseDetailsFormat.editCicaCaseDetails.cicaReferenceNumber).toBe('X/12/123456-TM1A');
});

test('if cicaReferenceNumber is populated and begins with lowercase, the first letter should be made uppercase', async () => {
  const editCicaCaseDetailsFormat = toApiFormat({ cicaReferenceNumber: 'x/12/123456-TM1A' });
  expect(editCicaCaseDetailsFormat.editCicaCaseDetails.cicaReferenceNumber).toBe('X/12/123456-TM1A');
});

test('if nothing is passed to toApiFormat then empty object should be returned', async () => {
  const emptyCase = toApiFormat({});
  expect(emptyCase).toStrictEqual({});
});
