import { randomUUID } from 'crypto';

import { AppRequest } from '../app/controller/AppRequest';

type DashboardJourneySession = AppRequest['session'] & {
  cicaDashboardJourneyId?: string;
};

export const getDashboardJourneyId = (req: AppRequest): string => {
  const session = req.session as DashboardJourneySession;
  session.cicaDashboardJourneyId ??= randomUUID();
  return session.cicaDashboardJourneyId;
};

export const startDashboardJourney = (req: AppRequest): string => {
  const session = req.session as DashboardJourneySession;
  session.cicaDashboardJourneyId = randomUUID();
  return session.cicaDashboardJourneyId;
};
