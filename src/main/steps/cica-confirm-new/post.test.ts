import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { YesOrNo } from '../../app/case/definition';
import { CICA_CONFIRM_NEW, CICA_LOOKUP, SUBJECT_DETAILS } from '../urls';

import CicaConfirmNewPostController from './post';

jest.mock('../../app/form/Form');

describe('CicaConfirmNewPostController', () => {
  const controller = new CicaConfirmNewPostController();

  let req;
  let res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();

    jest.clearAllMocks();

    // default: no validation errors
    const Form = require('../../app/form/Form').Form;
    Form.mockImplementation(() => ({
      getErrors: jest.fn().mockReturnValue([]),
    }));
  });

  test('should redirect back when validation fails', async () => {
    const Form = require('../../app/form/Form').Form;
    Form.mockImplementation(() => ({
      getErrors: jest.fn().mockReturnValue(['error']),
    }));

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_CONFIRM_NEW);
  });

  test('should redirect to subject details when YES selected', async () => {
    req.body = { startNewAppeal: YesOrNo.YES };

    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith(SUBJECT_DETAILS);
  });

  test('should redirect to lookup and clear session when NO selected', async () => {
    req.body = { startNewAppeal: YesOrNo.NO };

    await controller.post(req, res);

    expect(req.session.userCase).toEqual({ id: '', state: '' });
    expect(res.redirect).toHaveBeenCalledWith(CICA_LOOKUP);
  });
});
