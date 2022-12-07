import { getFormattedDate } from '../../../app/case/answers/formatDate';
import { CaseWithId } from '../../../app/case/case';
import { YesOrNo } from '../../../app/case/definition';
import { PageContent } from '../../../app/controller/GetController';
import * as Urls from '../../../steps/urls';

interface GovUkNunjucksSummary {
  key: {
    text?: string;
    html?: string;
    classes?: string;
  };
  value: {
    text?: string;
    html?: string;
  };
  actions?: {
    items?: [
      {
        href: string;
        text: string;
        visuallyHiddenText: string;
      }
    ];
  };
  classes?: string;
}

interface SummaryListRow {
  key?: string;
  keyHtml?: string;
  value?: string;
  valueHtml?: string;
  changeUrl?: string;
  classes?: string;
}

interface SummaryList {
  title: string;
  rows: GovUkNunjucksSummary[];
}

type SummaryListContent = PageContent & {
  sectionTitles: Record<string, string>;
  keys: Record<string, string>;
  language?: string;
};

const getSectionSummaryList = (rows: SummaryListRow[], content: PageContent): GovUkNunjucksSummary[] => {
  return rows.map(item => {
    const changeUrl = item.changeUrl;
    return {
      key: { ...(item.key ? { text: item.key } : {}), ...(item.keyHtml ? { html: item.keyHtml } : {}) },
      value: { ...(item.value ? { text: item.value } : {}), ...(item.valueHtml ? { html: item.valueHtml } : {}) },
      ...(changeUrl
        ? {
            actions: {
              items: [
                {
                  href: changeUrl, //
                  text: content.change as string,
                  visuallyHiddenText: `${item.key}`,
                },
              ],
            },
          }
        : {}),
      ...(item.classes ? { classes: item.classes } : {}),
    };
  });
};

/* eslint-disable import/namespace */
export const SubjectSummaryList = (
  { sectionTitles, keys, ...content }: SummaryListContent,
  userCase: Partial<CaseWithId>
): SummaryList | undefined => {
  const sectionTitle = sectionTitles.subjectDetails;

  const SummaryData = [
    {
      key: keys.fullName,
      value: userCase['subjectFullName'],
      changeUrl: Urls['SUBJECT_DETAILS'],
    },
    {
      key: keys.dateOfBirth,
      value: getFormattedDate(userCase['subjectDateOfBirth'], content.language),
      changeUrl: Urls['SUBJECT_DETAILS'],
    },
    {
      key: keys.emailAddress,
      value: userCase['subjectEmailAddress'],
      changeUrl: Urls['SUBJECT_CONTACT_DETAILS'],
    },
    {
      key: keys.contactNumber,
      value: userCase['subjectContactNumber'],
      changeUrl: Urls['SUBJECT_CONTACT_DETAILS'],
    },
  ];

  return {
    title: sectionTitle,
    rows: getSectionSummaryList(SummaryData, content),
  };
};

/* eslint-disable import/namespace */
export const RepresentationSummary = (
  { sectionTitles, keys, ...content }: SummaryListContent,
  userCase: Partial<CaseWithId>
): SummaryList | undefined => {
  const sectionTitle = sectionTitles.representation;
  const isRepresentation = userCase['representation'] === YesOrNo.YES ? 'Yes' : 'No';
  const isRepresentationQualified = userCase['representationQualified'] === YesOrNo.YES ? 'Yes' : 'No';

  const SummaryData =
    userCase['representation'] === YesOrNo.YES
      ? [
          {
            key: keys.representationLabel,
            value: isRepresentation,
            changeUrl: Urls['REPRESENTATION'],
          },
          {
            key: keys.representativeQualifiedLabel,
            value: isRepresentationQualified,
            changeUrl: Urls['REPRESENTATION_QUALIFIED'],
          },
        ]
      : [
          {
            key: keys.representationLabel,
            value: isRepresentation,
            changeUrl: Urls['REPRESENTATION'],
          },
        ];

  return {
    title: sectionTitle,
    rows: getSectionSummaryList(SummaryData, content),
  };
};

/* eslint-disable import/namespace */
export const RepresentativeSummaryList = (
  { sectionTitles, keys, ...content }: SummaryListContent,
  userCase: Partial<CaseWithId>
): SummaryList | undefined => {
  const sectionTitle = sectionTitles.representativeDetails;

  const SummaryData = [
    {
      key: keys.representativeFullName,
      value: userCase['representativeFullName'],
      changeUrl: Urls['REPRESENTATIVES_DETAILS'],
    },
    {
      key: keys.representativeOrganisationName,
      value: userCase['representativeOrganisationName'],
      changeUrl: Urls['REPRESENTATIVES_DETAILS'],
    },
    {
      key: keys.representativeContactNumber,
      value: userCase['representativeContactNumber'],
      changeUrl: Urls['REPRESENTATIVES_DETAILS'],
    },
    {
      key: keys.representativeEmailAddress,
      value: userCase['representativeEmailAddress'],
      changeUrl: Urls['REPRESENTATIVES_DETAILS'],
    },
  ];

  /** Removes entry in @summarydata if user is not a named user */

  return {
    title: sectionTitle,
    rows: getSectionSummaryList(SummaryData, content),
  };
};

/* eslint-disable import/namespace */
export const UploadAppealFormSummary = (
  { sectionTitles, keys, ...content }: SummaryListContent,
  uploadedDocuments: Partial<any>
): SummaryList | undefined => {
  const ListOfUploadedDocuments = uploadedDocuments
    .map((document): string => {
      return document.fileName + '';
    })
    .toString()
    .split(',')
    .join('<div class="govuk-!-margin-top-3"></div>');

  const SummaryData = [
    {
      key: keys.appealDocuments,
      value: ListOfUploadedDocuments,
      changeUrl: Urls['UPLOAD_APPEAL_FORM'],
    },
  ];

  return {
    title: 'List of forms uploaded ',
    rows: getSectionSummaryList(SummaryData, content),
  };
};

/* eslint-disable import/namespace */
export const AdditonalFormSummary = (
  { sectionTitles, keys, ...content }: SummaryListContent,
  AddDocuments: Partial<any>
): SummaryList | undefined => {
  const ListOfAdditionalDocuments = AddDocuments.map((document): string => {
    return document.fileName + '';
  })
    .toString()
    .split(',')
    .join('<div class="govuk-!-margin-top-3"></div>');

  const SummaryData = [
    {
      key: keys.additionalDocuments,
      value: ListOfAdditionalDocuments,
      changeUrl: Urls['ADDITIONAL_DOCUMENTS_UPLOAD'],
    },
  ];

  return {
    title: 'List of Documents uploaded  ',
    rows: getSectionSummaryList(SummaryData, content),
  };
};
