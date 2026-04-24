import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';

import CCDNotAuthorisedGetController from './get';

describe('CCDNotAuthorisedGetController', () => {
  const controller = new CCDNotAuthorisedGetController();

  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('ccd-not-authorised');
  const translations = resourceLoader.getFileContents().translations;

  test('Should render the not authorised page in English', async () => {
    const req = mockRequest();
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      'ccd-not-authorised/template',
      expect.objectContaining({
        ...translations.en,
      })
    );
  });

  test('Should render the not authorised page in Welsh', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.session.lang = 'cy';

    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      'ccd-not-authorised/template',
      expect.objectContaining({
        ...translations.cy,
      })
    );
  });
});
