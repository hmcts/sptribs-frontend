import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { State } from '../../app/case/definition';
import { CICA_LOOKUP, CICA_POSTCODE_VERIFICATION, NOT_AUTHORISED } from '../urls';

import DashboardGetController from './get';

jest.mock('../../app/controller/GetController');

describe('DashboardGetController', () => {
  const controller = new DashboardGetController();

  test('should redirect to CICA lookup if no case in session', async () => {
    const req = mockRequest({
      session: {
        userCase: undefined,
      },
    });
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_LOOKUP);
  });

  test('should redirect to CICA lookup if case has no id', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          state: State.Submitted,
        },
      },
    });
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_LOOKUP);
  });

  test('should redirect to CICA postcode verification if case has id but no postcode in session', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '1624351572550046',
          state: State.Submitted,
        },
        validatedPostcode: undefined,
      },
    });
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_POSTCODE_VERIFICATION);
  });

  test('should load empty dashboard with no docs returned', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '1624351572550046',
          state: State.DSS_Submitted,
        },
        validatedPostcode: 'SW1A 1AA',
      },
    });

    req.locals.api.getDocumentsByCaseId = jest.fn().mockResolvedValue({
      latestCaseBundleDocuments: [],
      contactPartiesDocuments: [],
      orderAndDecisionDocuments: [],
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(req.locals.api.getDocumentsByCaseId).toHaveBeenCalledWith('1624351572550046', 'SW1A 1AA');

    expect(res.locals.contactPartiesDocuments).toEqual([]);
    expect(res.locals.orderAndDecisionDocuments).toEqual([]);
    expect(res.locals.latestCaseBundleDocuments).toEqual([]);

    expect(res.locals.hasDocuments).toBe(false);
  });

  test('should handle errors and redirect to CICA lookup', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
        validatedPostcode: 'SW1A 1AA',
      },
    });

    // Set up the API mock to reject
    req.locals.api.getDocumentsByCaseId = jest.fn().mockRejectedValue(new Error('API Error'));

    const res = mockResponse();

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_LOOKUP);
    expect(req.locals.logger.error).toHaveBeenCalled();
  });

  test('should handle 401 errors, clear postcode and redirect to NOT_AUTHORISED', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
        validatedPostcode: 'SW1A 1AA',
      },
    });

    const mockError = {
      response: { status: 401 },
      message: 'Unauthorized',
    };
    req.locals.api.getDocumentsByCaseId = jest.fn().mockRejectedValue(mockError);

    const res = mockResponse();

    await controller.get(req, res);

    expect(req.session.validatedPostcode).toBeUndefined();
    expect(res.redirect).toHaveBeenCalledWith(NOT_AUTHORISED);
    expect(req.locals.logger.error).toHaveBeenCalled();
  });

  test('should handle 403 errors, clear postcode and redirect to NOT_AUTHORISED', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
        validatedPostcode: 'SW1A 1AA',
      },
    });

    const mockError = {
      response: { status: 403 },
      message: 'Forbidden',
    };
    req.locals.api.getDocumentsByCaseId = jest.fn().mockRejectedValue(mockError);

    const res = mockResponse();

    await controller.get(req, res);

    expect(req.session.validatedPostcode).toBeUndefined();
    expect(res.redirect).toHaveBeenCalledWith(NOT_AUTHORISED);
    expect(req.locals.logger.error).toHaveBeenCalled();
  });

  test('should extract and format multiple documents from fresh API call', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
          subjectFullName: 'Jane Doe',
        },
        validatedPostcode: 'SW1A 1AA',
      },
    });

    req.locals.api.getDocumentsByCaseId = jest.fn().mockResolvedValue({
      contactPartiesDocuments: [
        {
          document: {
            documentLink: {
              document_url: 'http://dm-store/documents/11111111-1111-1111-1111-111111111111',
              document_filename: 'document-one.pdf',
              document_binary_url: 'http://dm-store/documents/11111111-1111-1111-1111-111111111111/binary',
            },
            documentCategory: 'ApplicationForm',
            date: '2024-03-10',
          },
          downloaded: false,
        },
      ],
      orderAndDecisionDocuments: [
        {
          document: {
            documentLink: {
              document_url: 'http://dm-store/documents/22222222-2222-2222-2222-222222222222',
              document_filename: 'document-two.pdf',
              document_binary_url: 'http://dm-store/documents/22222222-2222-2222-2222-222222222222/binary',
            },
            documentCategory: 'Evidence',
            date: '2024-03-12',
          },
          downloaded: true,
        },
      ],
      latestCaseBundleDocuments: [
        {
          document: {
            documentLink: {
              document_url: 'http://dm-store/documents/33333333-3333-3333-3333-333333333333',
              document_filename: 'document-three.pdf',
              document_binary_url: 'http://dm-store/documents/33333333-3333-3333-3333-333333333333/binary',
            },
            documentCategory: 'Decision',
            date: null,
          },
          downloaded: false,
        },
      ],
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(res.locals.contactPartiesDocuments).toHaveLength(1);
    expect(res.locals.orderAndDecisionDocuments).toHaveLength(1);
    expect(res.locals.latestCaseBundleDocuments).toHaveLength(1);

    expect(res.locals.contactPartiesDocuments[0].name).toBe('document-one.pdf');
    expect(res.locals.contactPartiesDocuments[0].date).toBe('10/03/2024');
    expect(res.locals.contactPartiesDocuments[0].downloaded).toBe(false);

    expect(res.locals.orderAndDecisionDocuments[0].name).toBe('document-two.pdf');
    expect(res.locals.orderAndDecisionDocuments[0].date).toBe('12/03/2024');
    expect(res.locals.orderAndDecisionDocuments[0].downloaded).toBe(true);

    expect(res.locals.latestCaseBundleDocuments[0].name).toBe('document-three.pdf');
    expect(res.locals.latestCaseBundleDocuments[0].date).toBeUndefined();
    expect(res.locals.latestCaseBundleDocuments[0].downloaded).toBe(false);

    expect(res.locals.userFullName).toBe('Jane Doe');

    expect(res.locals.hasDocuments).toBe(true);
  });

  test('should handle case with no document collections', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
        validatedPostcode: 'SW1A 1AA',
      },
    });

    req.locals.api.getDocumentsByCaseId = jest.fn().mockResolvedValue({});

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(res.locals.contactPartiesDocuments).toHaveLength(0);
    expect(res.locals.orderAndDecisionDocuments).toHaveLength(0);
    expect(res.locals.latestCaseBundleDocuments).toHaveLength(0);

    expect(res.locals.hasDocuments).toBe(false);
  });

  test('should create correct download URLs with document ID', async () => {
    const documentId = 'abcd1234-abcd-1234-abcd-1234abcd5678';

    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
        validatedPostcode: 'SW1A 1AA',
      },
    });

    req.locals.api.getDocumentsByCaseId = jest.fn().mockResolvedValue({
      latestCaseBundleDocuments: [],
      orderAndDecisionDocuments: [],
      contactPartiesDocuments: [
        {
          document: {
            documentLink: {
              document_url: `http://dm-store/documents/${documentId}`,
              document_filename: 'my file.pdf',
              document_binary_url: `http://dm-store/documents/${documentId}/binary`,
            },
            documentCategory: 'ApplicationForm',
            date: '2024-01-01',
          },
          downloaded: false,
        },
      ],
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(res.locals.contactPartiesDocuments[0].downloadUrl).toContain('/dashboard/document/download');

    expect(res.locals.contactPartiesDocuments[0].downloadUrl).toContain(`documentId=${documentId}`);

    expect(res.locals.contactPartiesDocuments[0].downloadUrl).toContain(encodeURIComponent('my file.pdf'));
  });

  test('should skip documents without valid document ID in URL', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
        validatedPostcode: 'SW1A 1AA',
      },
    });

    req.locals.api.getDocumentsByCaseId = jest.fn().mockResolvedValue({
      latestCaseBundleDocuments: [],
      orderAndDecisionDocuments: [],
      contactPartiesDocuments: [
        {
          document: {
            documentLink: {
              document_url: 'http://dm-store/invalid-url',
              document_filename: 'test.pdf',
            },
            documentCategory: 'ApplicationForm',
            date: '2024-01-01',
          },
          downloaded: false,
        },
      ],
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    // Document with invalid URL should be skipped
    expect(res.locals.contactPartiesDocuments).toHaveLength(0);
    expect(res.locals.orderAndDecisionDocuments).toHaveLength(0);
    expect(res.locals.latestCaseBundleDocuments).toHaveLength(0);

    expect(res.locals.hasDocuments).toBe(false);
  });

  test('should use "Unknown document" when document filename is missing', async () => {
    const documentId = '12345678-1234-1234-1234-123456789012';

    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
        validatedPostcode: 'SW1A 1AA',
      },
    });

    req.locals.api.getDocumentsByCaseId = jest.fn().mockResolvedValue({
      latestCaseBundleDocuments: [],
      orderAndDecisionDocuments: [],
      contactPartiesDocuments: [
        {
          document: {
            documentLink: {
              document_url: `http://dm-store/documents/${documentId}`,
              document_binary_url: `http://dm-store/documents/${documentId}/binary`,
              // document_filename intentionally omitted
            },
            documentCategory: 'ApplicationForm',
            date: '2024-01-01',
          },
          downloaded: false,
        },
      ],
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(res.locals.contactPartiesDocuments).toHaveLength(1);
    expect(res.locals.contactPartiesDocuments[0].name).toBe('Unknown document');
    expect(res.locals.contactPartiesDocuments[0].downloadUrl).toContain(`documentId=${documentId}`);
    expect(res.locals.hasDocuments).toBe(true);
  });

  test('should extract document ID from URL without /binary suffix', async () => {
    const documentId = 'eeee1111-eeee-1111-eeee-111122223333';

    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
        validatedPostcode: 'SW1A 1AA',
      },
    });

    req.locals.api.getDocumentsByCaseId = jest.fn().mockResolvedValue({
      latestCaseBundleDocuments: [],
      orderAndDecisionDocuments: [],
      contactPartiesDocuments: [
        {
          document: {
            documentLink: {
              document_url: `http://dm-store/documents/${documentId}`,
              document_filename: 'test.pdf',
            },
            documentCategory: 'ApplicationForm',
            date: '2024-01-01',
          },
          downloaded: false,
        },
      ],
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(res.locals.contactPartiesDocuments[0].downloadUrl).toContain(`documentId=${documentId}`);
  });
});
