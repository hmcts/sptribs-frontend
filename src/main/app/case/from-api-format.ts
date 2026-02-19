import { invert } from 'lodash';

import { Case, CaseDate, formFieldsToCaseMapping, formatCase } from './case';
import { CaseData } from './definition';

type FromApiConverters = Partial<Record<keyof CaseData, string | ((data: Partial<CaseData>) => Partial<Case>)>>;

const fields: FromApiConverters = {
  ...invert(formFieldsToCaseMapping),
  dssCaseDataSubjectDateOfBirth: (data: Partial<CaseData>) => ({
    subjectDateOfBirth: fromApiDate(data.dssCaseDataSubjectDateOfBirth),
  }),
  editCicaCaseDetails: (data: Partial<CaseData>) => ({
    cicaReferenceNumber: data.editCicaCaseDetails?.cicaReferenceNumber,
  }),
  cicCaseInitialCicaDecisionDate: (data: Partial<CaseData>) => ({
    initialCicaDecisionDate: fromApiDate(data.cicCaseInitialCicaDecisionDate),
  }),
};

export const fromApiFormat = (data: CaseData): Case => formatCase(fields, data);

const fromApiDate = (date: string | undefined): CaseDate | undefined => {
  if (!date) {
    return;
  }

  const [y, m, d] = date.split('-');
  return { year: `${+y}`, month: `${+m}`, day: `${+d}` };
};
