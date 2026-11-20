import { CaseWithId } from '../app/case/case';
import { AppSession } from '../app/controller/AppRequest';

import { PageLink } from './urls';

export enum Sections {
  AboutEdgeCase = 'aboutEdgeCase',
}

export interface Step {
  url: string;
  showInSection?: Sections;
  showInCompleteSection?: Sections;
  excludeFromContinueApplication?: boolean;
  /** Overrides how we check whether this step is complete. If unset, the page's form validators are used. */
  isComplete?: (session: AppSession) => boolean;
  getNextStep: (data: Partial<CaseWithId>) => PageLink;
}
