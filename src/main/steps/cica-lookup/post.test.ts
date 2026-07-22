import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { Form } from '../../app/form/Form';
import { CICA_CONFIRM_NEW, CICA_LOOKUP, CICA_POSTCODE_VERIFICATION, NOT_AUTHORISED } from '../urls';

import CicaLookupPostController from './post';

jest.mock('../../app/form/Form');

describe('CicaLookupPostController', () => {
  const controller = new CicaLookupPostController();

  const mockCheckCaseAccess = jest.fn();

  const req = mockRequest({
    locals: {
      api: {
        checkCaseAccess: mockCheckCaseAccess,
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

  test('should redirect to postcode verification on success', async () => {
    mockCheckCaseAccess.mockResolvedValue(undefined);

    req.body = { ccdReference: '1234567890123456' } as any;

    await controller.post(req, res);

    expect(req.session.userCase).toEqual({
      id: '1234567890123456',
      state: '',
      ccdReferenceNumber: '1234567890123456',
    });

    expect(res.redirect).toHaveBeenCalledWith(CICA_POSTCODE_VERIFICATION);
  });

  test('should redirect to confirm new on 404', async () => {
    mockCheckCaseAccess.mockRejectedValue({
      response: { status: 404 },
    });

    req.body = { ccdReference: '1234567890123456' } as any;

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_CONFIRM_NEW);
  });

  test('should redirect to not authorised on 403', async () => {
    mockCheckCaseAccess.mockRejectedValue({
      response: { status: 403 },
    });

    req.body = { ccdReference: '1234567890123456' } as any;

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(NOT_AUTHORISED);
  });

  test('should fallback to confirm new on unknown error', async () => {
    mockCheckCaseAccess.mockRejectedValue({
      response: { status: 500 },
    });

    req.body = { ccdReference: '1234567890123456' } as any;

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_CONFIRM_NEW);
  });
});
