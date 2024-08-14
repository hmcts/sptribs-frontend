import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { SIGN_IN_URL } from '../../steps/urls';

import { GetController } from './GetController';

describe('GetController', () => {
  const languages = {
    en: {
      text: 'english',
    },
    cy: {
      text: 'welsh',
    },
  };

  const generateContent = content => languages[content.language];
  test('Should render the page', async () => {
    const controller = new GetController('page', generateContent);

    const req = mockRequest();
    const res = mockResponse();
    await controller.get(req, res);

    req.query = {
      analytics: 'off',
      apm: 'off',
    };

    expect(res.render).toHaveBeenCalledWith(expect.stringContaining('page'), expect.anything());
  });

  test('Detects when application is not in a draft state', async () => {
    const controller = new GetController('page', () => ({}));

    const req = mockRequest({ userCase: { state: '' } });
    const res = mockResponse();
    await controller.get(req, res);

    expect(res.render).toHaveBeenCalledWith(expect.stringContaining('page'), expect.anything());
  });

  describe('Getting the users preferred language', () => {
    test('Language via query string', async () => {
      const controller = new GetController('page', generateContent);

      const language = 'cy';
      const req = mockRequest();
      const res = mockResponse();
      req.query.lng = language;
      await controller.get(req, res);

      const documentManagerRequest = req;
      documentManagerRequest.session.caseDocuments = [
        {
          originalDocumentName: 'document1.docx',
          _links: {
            self: {
              href: 'http://dm-example/documents/sae33',
            },
            binary: {
              href: 'http://dm-example/documents/sae33/binary',
            },
          },
        },
        {
          originalDocumentName: 'document2.docx',
          _links: {
            self: {
              href: 'http://dm-example/documents/ce6e2',
            },
            binary: {
              href: 'http://dm-example/documents/ce6e2/binary',
            },
          },
        },
      ];

      documentManagerRequest.query = {
        query: 'delete',
        docId: 'xyz',
        documentType: 'applicationform',
      };

      await controller.get(documentManagerRequest, res);

      documentManagerRequest.query = {
        query: 'delete',
        docId: 'xyz',
        documentType: 'additional',
      };
      await controller.get(documentManagerRequest, res);

      expect(res.render).toHaveBeenCalledWith(expect.stringContaining('page'), expect.anything());
    });

    test('Language via session', async () => {
      const controller = new GetController('page', generateContent);

      const language = 'cy';
      const req = mockRequest();
      const res = mockResponse();
      req.session.lang = language;
      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(expect.stringContaining('page'), expect.anything());
    });

    test('Language via browser settings', async () => {
      const controller = new GetController('page', generateContent);

      const req = mockRequest({ headers: { 'accept-language': 'cy' } });
      const res = mockResponse();
      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(expect.stringContaining('page'), expect.anything());
    });

    test('Language via browser settings fallback to en', async () => {
      const controller = new GetController('page', generateContent);

      const req = mockRequest({ headers: { 'accept-language': 'unknown' } });
      const res = mockResponse();
      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(expect.stringContaining('page'), expect.anything());
    });
  });

  test("Doesn't call render if an error page has already been rendered upstream", async () => {
    const controller = new GetController('page', generateContent);

    const req = mockRequest();
    const res = mockResponse();
    res.locals.isError = true;
    await controller.get(req, res);

    expect(res.render).not.toHaveBeenCalled();
  });

  test("Doesn't call render if headers have already been sent already upstream", async () => {
    const controller = new GetController('page', generateContent);

    const req = mockRequest();
    const res = mockResponse();
    res.headersSent = true;
    await controller.get(req, res);

    expect(res.render).not.toHaveBeenCalled();
  });

  test('sends the current page form session state to the view', async () => {
    const controller = new GetController('page', generateContent);

    const req = mockRequest();
    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toHaveBeenCalledWith(expect.stringContaining('page'), expect.anything());
  });

  describe('generatePageContent()', () => {
    test('calls generatePageContent with correct arguments for new sessions', async () => {
      const getContentMock = jest.fn().mockReturnValue({});
      const controller = new GetController('page', getContentMock);

      const req = mockRequest({ userCase: { state: '' }, session: { errors: [] } });
      const res = mockResponse();
      await controller.get(req, res);

      expect(getContentMock).toHaveBeenCalledTimes(1);
      expect(res.render).toHaveBeenCalledWith(expect.stringContaining('page'), expect.anything());
    });
  });
});

describe('checking for documents Delete manager', () => {
  const languages = {
    en: {
      text: 'english',
    },
    cy: {
      text: 'welsh',
    },
  };

  const mockError = 'An error while saving session';

  it('should delete additional documents', async () => {
    const generateContent = content => languages[content.language];
    const controller = new GetController('page', generateContent);

    const req = mockRequest();
    const res = mockResponse();
    req.session.caseDocuments = [
      {
        originalDocumentName: 'document1.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/sae33',
          },
          binary: {
            href: 'http://dm-example/documents/sae33/binary',
          },
        },
      },
      {
        originalDocumentName: 'document2.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
    ];

    req.query = {
      query: 'delete',
      documentId: '10',
      documentType: 'applicationform',
    };
    await controller.get(req, res);
    expect(req.session.caseDocuments.some(doc => doc.id === '10')).toBe(false);
  });

  it('should return an english error message when an error is thrown with english language preferences', async () => {
    const generateContent = content => languages[content.language];
    const controller = new GetController('page', generateContent);

    const req = mockRequest({ session: { save: jest.fn(done => done(mockError)) } });
    const res = mockResponse();

    req.query = {
      query: 'delete',
      docId: '10',
      documentType: 'tribunalform',
    };

    await expect(controller.documentDeleteManager(req, res, 'en')).rejects.toEqual('An error while saving session');
    expect(req.session.fileErrors).toEqual(
      expect.arrayContaining([{ text: 'Document upload or deletion has failed. Try again', href: '#' }])
    );

    req.query.documentType = 'supporting';
    await expect(controller.documentDeleteManager(req, res, 'en')).rejects.toEqual('An error while saving session');
    expect(req.session.fileErrors).toEqual(
      expect.arrayContaining([{ text: 'Document upload or deletion has failed. Try again', href: '#' }])
    );

    req.query.documentType = 'other';
    await expect(controller.documentDeleteManager(req, res, 'en')).rejects.toEqual('An error while saving session');
    expect(req.session.fileErrors).toEqual(
      expect.arrayContaining([{ text: 'Document upload or deletion has failed. Try again', href: '#' }])
    );
  });

  it('should return a welsh error message when an error is thrown with welsh language preferences', async () => {
    const generateContent = content => languages[content.language];
    const controller = new GetController('page', generateContent);

    const req = mockRequest({ session: { save: jest.fn(done => done(mockError)) } });
    const res = mockResponse();

    req.query = {
      query: 'delete',
      docId: '10',
      documentType: 'tribunalform',
    };

    await expect(controller.documentDeleteManager(req, res, 'cy')).rejects.toEqual('An error while saving session');
    expect(req.session.fileErrors).toEqual(
      expect.arrayContaining([{ text: 'Mae llwytho neu ddileu ffeil wedi methu. Rhowch gynnig arall arni', href: '#' }])
    );

    req.query.documentType = 'supporting';
    await expect(controller.documentDeleteManager(req, res, 'cy')).rejects.toEqual('An error while saving session');
    expect(req.session.fileErrors).toEqual(
      expect.arrayContaining([{ text: 'Mae llwytho neu ddileu ffeil wedi methu. Rhowch gynnig arall arni', href: '#' }])
    );

    req.query.documentType = 'other';
    await expect(controller.documentDeleteManager(req, res, 'cy')).rejects.toEqual('An error while saving session');
    expect(req.session.fileErrors).toEqual(
      expect.arrayContaining([{ text: 'Mae llwytho neu ddileu ffeil wedi methu. Rhowch gynnig arall arni', href: '#' }])
    );
  });
});

describe('parseAndSetReturnUrl', () => {
  test('req.session.returnUrl populated', async () => {
    const controller = new GetController('page', () => ({}));
    const req = mockRequest();
    req.query = { returnUrl: SIGN_IN_URL };

    controller.parseAndSetReturnUrl(req);

    expect(req.session.returnUrl).toEqual(SIGN_IN_URL);
  });

  test('returnUrl not populated if returnUrl not set', async () => {
    const controller = new GetController('page', () => ({}));
    const req = mockRequest();

    controller.parseAndSetReturnUrl(req);

    expect(req.session.returnUrl).toBeFalsy();
  });

  test('returnUrl not populated if returnUrl not a valid pagelink url', async () => {
    const controller = new GetController('page', () => ({}));
    const req = mockRequest();

    controller.parseAndSetReturnUrl(req);

    expect(req.session.returnUrl).toBeFalsy();
  });
});
