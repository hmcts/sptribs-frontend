import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';

import { cy, en } from './content';
import { ContactUsGetController } from './get';

describe('ContactUsGetController', () => {
  const controller = new ContactUsGetController();

  test('Should render the contact us page', async () => {
    const req = mockRequest();
    const res = mockResponse();
    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      expect.stringContaining(__dirname + '/contact-us'),
      expect.objectContaining(en)
    );
  });

  test('Should render the contact us page for Welsh', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.session.lang = 'cy';
    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      expect.stringContaining(__dirname + '/contact-us'),
      expect.objectContaining(cy)
    );
  });
});
