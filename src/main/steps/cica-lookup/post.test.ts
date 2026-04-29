import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { Form } from '../../app/form/Form';
import { CICA_CONFIRM_NEW, CICA_LOOKUP, DASHBOARD_URL, NOT_AUTHORISED } from '../urls';

import CicaLookupPostController from './post';

jest.mock('../../app/form/Form');

describe('CicaLookupPostController', () => {
  const controller = new CicaLookupPostController();

  const mockGetCase = jest.fn();

  const req = mockRequest({
    locals: {
      api: {
        getCaseByCCDReference: mockGetCase,
      },
      logger: {
        error: jest.fn(),
      },
    },
  });

  const res = mockResponse();

  beforeEach(() => {
    jest.clearAllMocks();

    (Form as jest.Mock).mockImplementation(() => ({
      getErrors: jest.fn().mockReturnValue([]), // default: no errors
    }));
  });

  test('should redirect back to lookup when validation fails', async () => {
    req.body = {};
    req.session.errors = [{ propertyName: 'ccdReference', errorType: 'required' }];

    (Form as jest.Mock).mockImplementation(() => ({
      getErrors: jest.fn().mockReturnValue([{ propertyName: 'ccdReference', errorType: 'required' }]),
    }));

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_LOOKUP);
  });

  test('should redirect to dashboard on success', async () => {
    mockGetCase.mockResolvedValue({
      id: '123',
      state: 'Submitted',
    });

    req.body = { ccdReference: '1234567890123456' } as any;

    await controller.post(req, res);

    expect(req.session.userCase).toEqual({
      id: '123',
      state: 'Submitted',
    });

    expect(res.redirect).toHaveBeenCalledWith(DASHBOARD_URL);
  });

  test('should redirect to confirm new on 404', async () => {
    mockGetCase.mockRejectedValue({
      response: { status: 404 },
    });

    req.body = { ccdReference: '1234567890123456' } as any;

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_CONFIRM_NEW);
  });

  test('should redirect to not authorised on 403', async () => {
    mockGetCase.mockRejectedValue({
      response: { status: 403 },
    });

    req.body = { ccdReference: '1234567890123456' } as any;

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(NOT_AUTHORISED);
  });

  test('should fallback to confirm new on unknown error', async () => {
    mockGetCase.mockRejectedValue({
      response: { status: 500 },
    });

    req.body = { ccdReference: '1234567890123456' } as any;

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_CONFIRM_NEW);
  });
});
