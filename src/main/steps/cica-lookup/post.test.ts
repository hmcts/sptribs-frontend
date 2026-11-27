import { Response } from 'express';

import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject } from '../../app/controller/PostController';
import { CICA_CONFIRM_NEW, CICA_LOOKUP, CICA_POSTCODE_VERIFICATION, NOT_AUTHORISED, SUBJECT_DETAILS } from '../urls';

import CicaLookupPostController from './post';

describe('CicaLookupPostController', () => {
  const controller = new CicaLookupPostController();

  const mockCheckCaseAccess = jest.fn();

  let req: AppRequest<AnyObject>;
  let res: Response;

  beforeEach(() => {
    mockCheckCaseAccess.mockReset();
    req = mockRequest({ locals: { api: { checkCaseAccess: mockCheckCaseAccess } } });
    res = mockResponse();
  });

  test('should redirect to subject-details when startNewAppeal selected', async () => {
    req.session.userCase.id = '';
    req.body['ccdReference'] = '1234';
    req.body['cancel'] = true;
    req.session.ccdReferenceForRetry = '1234-56';

    await controller.post(req, res);

    expect(req.session.userCase.id).toEqual('');
    expect(req.body['ccdReference']).toEqual('');
    expect(req.session.ccdReferenceForRetry).toBeUndefined();
    expect(mockCheckCaseAccess).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(SUBJECT_DETAILS + '#');
  });

  test.each([
    [undefined, 'required'],
    ['', 'required'],
    ['   ', 'required'],
    ['1234-5678-9012-345', 'invalid'],
    ['1234a - 5678 - 9012 - 3456', 'invalid'],
    ['1234 - 5678 - 9012 - 3456!', 'invalid'],
    ['<1234567890123456>', 'containsInvalidCharacters'],
    [['1234567890123456', '1234567890123456'], 'invalid'],
  ])('should redirect back to lookup without checking case access for %p', async (input, errorType) => {
    req.body = { ccdReference: input };
    const originalCase = { ...req.session.userCase };

    await expect(controller.post(req, res)).resolves.toBeUndefined();

    expect(req.session.errors).toEqual([{ propertyName: 'ccdReference', errorType }]);
    expect(req.session.ccdReferenceForRetry).toBe(typeof input === 'string' ? input : undefined);
    expect(req.session.userCase).toEqual(originalCase);
    expect(mockCheckCaseAccess).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(CICA_LOOKUP + '#');
  });

  test.each(['0123456789012345', '0123-4567-8901-2345', '0123 4567 8901 2345', ' 0123 - 4567 - 8901 - 2345 '])(
    'should look up the digits only and redirect to postcode verification for %p',
    async submittedReference => {
      mockCheckCaseAccess.mockResolvedValue(undefined);
      req.body = { ccdReference: submittedReference };

      await controller.post(req, res);

      expect(mockCheckCaseAccess).toHaveBeenCalledWith('0123456789012345');
      expect(req.session.userCase).toEqual({
        id: '0123456789012345',
        state: '',
        ccdReferenceNumber: '0123456789012345',
      });
      expect(req.locals.logger.info).toHaveBeenCalledWith(
        'CICA dashboard journey event',
        expect.objectContaining({
          event: 'cica_lookup_succeeded',
          outcome: 'success',
          journey_id: expect.any(String),
          attempt_id: expect.any(String),
        })
      );
      expect(res.redirect).toHaveBeenCalledWith(CICA_POSTCODE_VERIFICATION + '#');
    }
  );

  test('should redirect to confirm new on 404', async () => {
    mockCheckCaseAccess.mockRejectedValue({
      response: { status: 404 },
    });

    req.body = { ccdReference: '1234 - 5678 - 9012 - 3456' };

    await controller.post(req, res);

    expect(mockCheckCaseAccess).toHaveBeenCalledWith('1234567890123456');
    expect(req.session.userCase.ccdReferenceNumber).toBe('1234567890123456');
    expect(res.redirect).toHaveBeenCalledWith(CICA_CONFIRM_NEW + '#');
  });

  test('should redirect to not authorised on 403', async () => {
    mockCheckCaseAccess.mockRejectedValue({
      response: { status: 403 },
    });

    req.body = { ccdReference: '1234567890123456' };

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(NOT_AUTHORISED + '#');
  });

  test('should redirect back to lookup on 400', async () => {
    mockCheckCaseAccess.mockRejectedValueOnce({
      response: { status: 400 },
    });

    req.body = { ccdReference: '1234 - 5678 - 9012 - 3456' };

    await controller.post(req, res);

    expect(req.session.errors).toEqual([{ propertyName: 'ccdReference', errorType: 'invalid' }]);
    expect(req.session.ccdReferenceForRetry).toBe('1234 - 5678 - 9012 - 3456');
    expect(req.locals.logger.error).toHaveBeenCalledWith(
      'CICA dashboard journey event',
      expect.objectContaining({
        event: 'cica_lookup_failed',
        outcome: 'invalid_reference',
        next_step: 'cica_lookup',
        upstream_status: 400,
      })
    );
    expect(res.redirect).toHaveBeenCalledWith(CICA_LOOKUP + '#');
  });

  test('should fallback to confirm new on unknown error', async () => {
    mockCheckCaseAccess.mockRejectedValue({
      response: { status: 500 },
    });

    req.body = { ccdReference: '1234567890123456' };

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_CONFIRM_NEW + '#');
  });
});
