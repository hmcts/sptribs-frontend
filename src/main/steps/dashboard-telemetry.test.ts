import { mockRequest } from '../../test/unit/utils/mockRequest';

import { getDashboardJourneyId, startDashboardJourney } from './dashboard-telemetry';

describe('dashboard telemetry', () => {
  test('keeps a journey ID for subsequent steps and replaces it for a new lookup', () => {
    const req = mockRequest();

    const firstJourneyId = getDashboardJourneyId(req);

    expect(getDashboardJourneyId(req)).toBe(firstJourneyId);

    const nextJourneyId = startDashboardJourney(req);

    expect(nextJourneyId).not.toBe(firstJourneyId);
    expect(getDashboardJourneyId(req)).toBe(nextJourneyId);
  });
});
