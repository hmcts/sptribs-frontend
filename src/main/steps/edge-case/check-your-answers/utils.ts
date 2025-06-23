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
      },
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
  values: Record<string, string>;
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
  { sectionTitles, keys, values, ...content }: SummaryListContent,
  userCase: Partial<CaseWithId>
): SummaryList | undefined => {
  const sectionTitle = sectionTitles.representation;
  const isRepresentation = userCase['representation'] === YesOrNo.YES ? values.yes : values.no;
  const isRepresentationQualified = userCase['representationQualified'] === YesOrNo.YES ? values.yes : values.no;

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
  const sectionTitle = sectionTitles.documents;
  const ListOfUploadedDocuments = uploadedDocuments
    .map((document): string => {
      return document.name + '';
    })
    .toString()
    .split(',')
    .join('\n');

  const SummaryData = [
    {
      key: keys.appealDocuments,
      value: ListOfUploadedDocuments,
      changeUrl: Urls['UPLOAD_APPEAL_FORM'],
    },
  ];

  return {
    title: sectionTitle,
    rows: getSectionSummaryList(SummaryData, content),
  };
};

/* eslint-disable import/namespace */
export const SupportingDocumentsSummary = (
  { sectionTitles, keys, ...content }: SummaryListContent,
  AddDocuments: Partial<any>
): SummaryList | undefined => {
  const sectionTitle = sectionTitles.supportingDocuments;
  const ListOfSupportingDocuments = AddDocuments.map((document): string => {
    return document.name + '';
  })
    .toString()
    .split(',')
    .join('\n');

  const SummaryData = [
    {
      key: keys.supportingDocuments,
      value: ListOfSupportingDocuments,
      changeUrl: Urls['UPLOAD_SUPPORTING_DOCUMENTS'],
    },
  ];

  return {
    title: sectionTitle,
    rows: getSectionSummaryList(SummaryData, content),
  };
};

/* eslint-disable import/namespace */
export const OtherInformationSummary = (
  { sectionTitles, keys, ...content }: SummaryListContent,
  OtherDocuments: Partial<any>,
  userCase: Partial<CaseWithId>
): SummaryList | undefined => {
  const sectionTitle = sectionTitles.otherInformation;

  const additionalInformation = {
    key: keys.additionalInformation,
    value: userCase['additionalInformation'],
    changeUrl: Urls['UPLOAD_OTHER_INFORMATION'],
  };

  const documentInformation: { [key: string]: string }[] = [];

  OtherDocuments.map((document: any) => {
    documentInformation.push({
      key: keys.otherInformation,
      value: document.name,
      changeUrl: Urls['UPLOAD_OTHER_INFORMATION'],
    });

    documentInformation.push({
      keyHtml: '<hr width=1000 height=100>' + keys.documentRelevance,
      value: document.description,
    });
  });

  const SummaryData = [additionalInformation, ...documentInformation].filter(item => item);

  return {
    title: sectionTitle,
    rows: getSectionSummaryList(SummaryData, content),
  };
};
