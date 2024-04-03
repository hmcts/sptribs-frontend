import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';

import { TimedOutGetController } from './get';

describe('TimedOutGetController', () => {
  const controller = new TimedOutGetController();

  test('Should destroy session and render timeout page', async () => {
    const req = mockRequest();
    const res = mockResponse();
    await controller.get(req, res);

    expect(req.session.destroy).toHaveBeenCalled();
    expect(res.render).toHaveBeenCalledWith(expect.stringContaining('/timed-out'), expect.anything());
  });
});
