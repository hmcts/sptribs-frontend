import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';

import { cy, en } from './content';
import { PrivacyPolicyGetController } from './get';

describe('PrivacyPolicyGetController', () => {
  const controller = new PrivacyPolicyGetController();

  test('Should render the privacy policy page with adoption content', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.session.lang = 'en';
    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      expect.stringContaining(__dirname + '/template'),
      expect.objectContaining(en)
    );
  });

  test('Should render the privacy policy page with adoption content for Welsh', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.session.lang = 'cy';
    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      expect.stringContaining(__dirname + '/template'),
      expect.objectContaining(cy)
    );
  });
});
