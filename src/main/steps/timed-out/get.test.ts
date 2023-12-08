import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';

import { en } from './content';
import { TimedOutGetController } from './get';

describe('TimedOutGetController', () => {
  const controller = new TimedOutGetController();

  test('Should render the time out page', async () => {
    const req = mockRequest();
    const res = mockResponse();
    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      expect.stringContaining(__dirname+'/template'),
      expect.objectContaining(en)
    );
  });
});
