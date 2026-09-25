import { mockRequest } from '../../test/unit/utils/mockRequest';

import {
  classifyDashboardError,
  createDashboardAttemptId,
  getDashboardJourneyId,
  startDashboardJourney,
  trackDashboardEvent,
} from './dashboard-telemetry';

describe('dashboard telemetry', () => {
  test('keeps a journey ID for subsequent steps and replaces it for a new lookup', () => {
    const req = mockRequest();

    const firstJourneyId = getDashboardJourneyId(req);

    expect(getDashboardJourneyId(req)).toBe(firstJourneyId);

    const nextJourneyId = startDashboardJourney(req);

    expect(nextJourneyId).not.toBe(firstJourneyId);
    expect(getDashboardJourneyId(req)).toBe(nextJourneyId);
  });

  test('adds consistent correlation and safe context to events', () => {
    const req = mockRequest({ session: { lang: 'cy' } });
    const attemptId = createDashboardAttemptId();

    trackDashboardEvent(req, {
      event: 'dashboard_loaded',
      step: 'dashboard',
      outcome: 'success',
      attempt_id: attemptId,
      duration_ms: 25,
    });

    expect(req.locals.logger.info).toHaveBeenCalledWith('CICA dashboard journey event', {
      journey: 'cica_dashboard',
      journey_id: expect.any(String),
      language: 'cy',
      event: 'dashboard_loaded',
      step: 'dashboard',
      outcome: 'success',
      attempt_id: attemptId,
      duration_ms: 25,
    });
  });

  test.each([
    [{ code: 'ETIMEDOUT' }, 'timeout'],
    [{ code: 'ECONNRESET' }, 'connection_error'],
    [{ response: { status: 429 } }, 'rate_limited'],
    [{ response: { status: 503 } }, 'upstream_5xx'],
    [{ response: { status: 400 } }, 'upstream_4xx'],
    [{}, 'unknown_error'],
  ])('classifies errors without logging their payloads', (error, expectedOutcome) => {
    expect(classifyDashboardError(error)).toBe(expectedOutcome);
  });
});
