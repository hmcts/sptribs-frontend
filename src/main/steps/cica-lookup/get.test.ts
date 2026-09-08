import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';

import CCDLookupGetController from './get';

describe('CCDLookupGetController', () => {
  const controller = new CCDLookupGetController();

  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('cica-lookup');

  const translations = resourceLoader.getFileContents().translations;
  const errors = resourceLoader.getFileContents().errors;

  test('Should render the lookup page in English', async () => {
    const req = mockRequest();
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      'cica-lookup/template',
      expect.objectContaining({
        ...translations.en,
        errors: {
          ...errors.en,
        },
      })
    );
  });

  test('Should render the lookup page in Welsh', async () => {
    const req = mockRequest();
    req.session.lang = 'cy';

    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      'cica-lookup/template',
      expect.objectContaining({
        ...translations.cy,
        errors: {
          ...errors.cy,
        },
      })
    );
  });
});
