import { Request } from 'express';
import { Session } from 'express-session';
import type { LoggerInstance } from 'winston';

import { CaseApi } from '../case/CaseApi';
import { Case, CaseWithId } from '../case/case';
import { CaseDocumentManagementClient, DocumentManagementFile } from '../document/CaseDocumentManagementClient';
import { FormError } from '../form/Form';

export interface AppRequest<T = Partial<Case>> extends Request {
  session: AppSession;
  locals: {
    env: string;
    lang: string;
    logger: LoggerInstance;
    api: CaseApi;
    documentApi: CaseDocumentManagementClient;
  };
  body: T;
}

export interface AppSession extends Session {
  csrfSecret: string;
  rpeToken: any;
  caseDocuments: DocumentManagementFile[];
  supportingCaseDocuments: DocumentManagementFile[];
  otherCaseInformation: DocumentManagementFile[];
  cookieMessage: boolean;
  user: UserDetails;
  userCase: CaseWithId;
  eligibility: Eligibility;
  lang: string | undefined;
  errors: FormError[] | undefined;
  fileErrors: any[];
  addresses: [];
  returnUrl?: string;
  cookieStorageMessage?: boolean;
}

export interface UserDetails {
  accessToken: string;
  id: string;
  email: string;
  givenName: string;
  familyName: string;
  roles: string[];
}

export interface Eligibility {
  under18Eligible?: string;
  marriedEligible?: string;
  livedUKEligible?: string;
  under21Eligible?: string;
}
