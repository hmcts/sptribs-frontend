import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';
import { CICA_LOOKUP } from '../urls';

import PostcodeVerificationGetController from './get';

describe('PostcodeVerificationGetController', () => {
  const controller = new PostcodeVerificationGetController();

  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('cica-postcode-verification');

  const translations = resourceLoader.getFileContents().translations;
  const errors = resourceLoader.getFileContents().errors;

  test('Should redirect to CICA lookup if no case id in session', async () => {
    const req = mockRequest({
      session: {
        userCase: undefined,
      },
    });
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_LOOKUP);
  });

  test('Should render the postcode page in English when case id exists', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '1234567890123456',
          state: 'Submitted',
        },
      },
    });
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      'cica-postcode-verification/template',
      expect.objectContaining({
        ...translations.en,
        errors: {
          ...errors.en,
        },
      })
    );
  });

  test('Should render the postcode page in Welsh when case id exists', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '1234567890123456',
          state: 'Submitted',
        },
      },
    });
    req.session.lang = 'cy';

    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      'cica-postcode-verification/template',
      expect.objectContaining({
        ...translations.cy,
        errors: {
          ...errors.cy,
        },
      })
    );
  });
});
