import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { USER_ROLE } from '../urls';

import { HomeGetController } from './get';

describe('HomeGetController', () => {
  const controller = new HomeGetController();

  test('redirects to the first question for new users', () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          mockQuestion: 'mockExistingAnswer',
        },
      },
    });
    const res = mockResponse();
    controller.get(req, res);

    expect(res.redirect).toBeCalledWith(USER_ROLE);
  });

  test('redirects to the check your answers page for existing users', () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
        },
      },
    });
    const res = mockResponse();
    controller.get(req, res);

    expect(res.redirect).toBeCalledWith(USER_ROLE);
  });

  test('redirects to application sent for review page for applicant 1 users in awaitingApplicant2 state', () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: '',
        },
      },
    });
    const res = mockResponse();
    controller.get(req, res);

    expect(res.redirect).toBeCalledWith(USER_ROLE);
  });

  test('redirects to confirmation page for applicant 1 users in applicant2Approved state', () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: '',
        },
      },
    });
    const res = mockResponse();
    controller.get(req, res);

    expect(res.redirect).toBeCalledWith(USER_ROLE);
  });

  test('redirects to application submitted page for applicant 1 users in submitted state', () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: '',
        },
      },
    });
    const res = mockResponse();
    controller.get(req, res);

    expect(res.redirect).toBeCalledWith(USER_ROLE);
  });

  test('redirects to the check your answers page for applicant 1 users in awaitingApplicant1Response state', () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: '',
        },
      },
    });
    const res = mockResponse();
    controller.get(req, res);

    expect(res.redirect).toBeCalledWith(USER_ROLE);
  });

  test('redirects to the pay your fee page for applicant 1 users for sole application in awaitingPayment state', () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: '',
        },
      },
    });
    const res = mockResponse();
    controller.get(req, res);

    expect(res.redirect).toBeCalledWith(USER_ROLE);
  });

  test('redirects to the hub page for applicant 1 users in holding state', () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: '',
        },
      },
    });
    const res = mockResponse();
    controller.get(req, res);

    expect(res.redirect).toBeCalledWith(USER_ROLE);
  });
});
