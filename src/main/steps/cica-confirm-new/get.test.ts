import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';

import CicaConfirmNewGetController from './get';

describe('CicaConfirmNewGetController', () => {
  const controller = new CicaConfirmNewGetController();

  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('cica-confirm-new');

  const translations = resourceLoader.getFileContents().translations;
  const errors = resourceLoader.getFileContents().errors;

  const ccdReference = '1234567890123456';

  test('Should render the confirm new page in English', async () => {
    const req = mockRequest({
      userCase: { ccdReferenceNumber: ccdReference },
    });
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      'cica-confirm-new/template',
      expect.objectContaining({
        ...translations.en,
        line1: `${translations.en.line1Part1}${ccdReference}${translations.en.line1Part2}`,
        errors: {
          ...errors.en,
        },
      })
    );
  });

  test('Should render the confirm new page in Welsh', async () => {
    const req = mockRequest({
      userCase: { ccdReferenceNumber: ccdReference },
    });
    req.session.lang = 'cy';

    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      'cica-confirm-new/template',
      expect.objectContaining({
        ...translations.cy,
        line1: `${translations.cy.line1Part1}${ccdReference}${translations.cy.line1Part2}`,
        errors: {
          ...errors.cy,
        },
      })
    );
  });

  test('Should default ccd reference to empty string when missing', async () => {
    const req = mockRequest({
      userCase: {},
    });
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        line1: `${translations.en.line1Part1}${''}${translations.en.line1Part2}`,
      })
    );
  });
});
