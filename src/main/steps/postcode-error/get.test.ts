import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';

import PostcodeErrorGetController from './get';

describe('PostcodeErrorGetController', () => {
  const controller = new PostcodeErrorGetController();

  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('postcode-error');
  const translations = resourceLoader.getFileContents().translations;

  test('Should render the postcode error page in English', async () => {
    const req = mockRequest();
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      'postcode-error/template',
      expect.objectContaining({
        ...translations.en,
      })
    );
  });

  test('Should render the postcode error page in Welsh', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.session.lang = 'cy';

    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      'postcode-error/template',
      expect.objectContaining({
        ...translations.cy,
      })
    );
  });
});
