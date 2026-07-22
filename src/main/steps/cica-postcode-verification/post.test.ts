import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { Form } from '../../app/form/Form';
import { CICA_LOOKUP, CICA_POSTCODE_VERIFICATION, DASHBOARD_URL } from '../urls';

import PostcodeVerificationPostController from './post';

jest.mock('../../app/form/Form');

describe('PostcodeVerificationPostController', () => {
  const controller = new PostcodeVerificationPostController();

  const req = mockRequest({
    locals: {
      api: {},
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

  test('should redirect back to postcode verification when validation fails', async () => {
    req.body = {};
    req.session.errors = [{ propertyName: 'postcode', errorType: 'required' }];

    (Form as jest.Mock).mockImplementation(() => ({
      getErrors: jest.fn().mockReturnValue([{ propertyName: 'postcode', errorType: 'required' }]),
    }));

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_POSTCODE_VERIFICATION);
  });

  test('should redirect to lookup if no case id in session', async () => {
    req.session.userCase = undefined as any;
    req.body = { postcode: 'SW1A 1AA' } as any;

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_LOOKUP);
  });

  test('should set validatedPostcode directly and redirect to dashboard on success', async () => {
    req.session.userCase = { id: '1234567890123456', state: 'Submitted' } as any;
    req.body = { postcode: 'SW1A 1AA' } as any;

    await controller.post(req, res);

    expect(req.session.validatedPostcode).toBe('SW1A 1AA');
    expect(res.redirect).toHaveBeenCalledWith(DASHBOARD_URL);
  });
});
