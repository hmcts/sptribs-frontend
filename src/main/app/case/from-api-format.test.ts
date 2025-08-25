import { CaseData, EditCicaCaseDetails } from './definition';
import { fromApiFormat } from './from-api-format';

describe('from-api-format', () => {
  const results: Partial<Record<keyof CaseData, string | any | null>> = {};

  describe('converting your address between UK and international', () => {
    test('converts to an international format', () => {
      const nfdivFormat = fromApiFormat({
        ...results,
        applicantHomeAddress: {
          AddressLine1: 'Line 1',
          AddressLine2: 'Line 2',
          AddressLine3: 'Line 3',
          PostTown: 'Town',
          County: 'State',
          PostCode: 'Zip code',
          Country: 'Country',
        },
      } as unknown as CaseData);

      expect(nfdivFormat).toMatchObject({});
    });
  });

  describe('pulling CICA reference number from editCicaCaseDetails to cicaReferenceNumber', () => {
    test('extracts to cicaReferenceNumber', () => {
      const nfdivFormat = fromApiFormat({
        ...results,
        editCicaCaseDetails: { cicaReferenceNumber: 'CICA123456' } as EditCicaCaseDetails,
      } as unknown as CaseData);

      expect(nfdivFormat).toStrictEqual({ cicaReferenceNumber: 'CICA123456' });
    });

    test('when without editCicaCaseDetails.cicaReferenceNumber, cicaReferenceNumber is undefined', () => {
      const nfdivFormat = fromApiFormat({
        ...results,
        editCicaCaseDetails: { cicaCaseWorker: '', cicaCasePresentingOfficer: '' } as EditCicaCaseDetails,
      } as unknown as CaseData);

      expect(nfdivFormat).toStrictEqual({ cicaReferenceNumber: undefined });
    });
  });
});
