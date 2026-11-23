import { Case, CaseDate, formFieldsToCaseMapping, formatCase } from './case';
import { CaseData } from './definition';

export type OrNull<T> = { [K in keyof T]: T[K] | null };

type ToApiConverters = Partial<Record<keyof Case, string | ((data: Case) => OrNull<Partial<CaseData>>)>>;

export const fields: ToApiConverters = {
  ...formFieldsToCaseMapping,
  subjectDateOfBirth: (data: Case) => ({
    dssCaseDataSubjectDateOfBirth: toApiDate(data.subjectDateOfBirth),
  }),
  cicaReferenceNumber: (data: Case) => ({
    editCicaCaseDetails: {
      cicaReferenceNumber: toApiCicaReferenceNumber(data.cicaReferenceNumber),
    },
  }),
  initialCicaDecisionDate: (data: Case) => ({
    cicCaseInitialCicaDecisionDate: toApiDate(data.initialCicaDecisionDate),
  }),
};

export const toApiFormat = (data: Partial<Case>): CaseData => formatCase(fields, data);

const toApiCicaReferenceNumber = (cicaReferenceNumber: string): string => {
  // Convert the first character to uppercase, since we accepted lowercase characters as user input
  return cicaReferenceNumber[0].toUpperCase() + cicaReferenceNumber.slice(1);
};

const toApiDate = (date: CaseDate | undefined): string => {
  if (!date?.year || !date?.month || !date?.day) {
    return '';
  }
  return date.year + '-' + date.month.padStart(2, '0') + '-' + date.day.padStart(2, '0');
};
