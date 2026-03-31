import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { State } from '../../app/case/definition';
import { CICA_LOOKUP, SUBJECT_DETAILS } from '../urls';

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

  test('should redirect to subject details if case is not submitted', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Draft,
        },
      },
    });
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(SUBJECT_DETAILS);
  });

  test('should load dashboard with submitted case and documents from fresh API call', async () => {
    const mockApplicantDocuments = [
      {
        id: 'doc1',
        value: {
          documentLink: {
            document_url: 'http://dm-store/documents/12345678-1234-1234-1234-123456789012',
            document_filename: 'test-document.pdf',
            document_binary_url: 'http://dm-store/documents/12345678-1234-1234-1234-123456789012/binary',
          },
          documentCategory: 'ApplicationForm',
          date: '2024-01-15',
        },
      },
    ];

    const req = mockRequest({
      session: {
        userCase: {
          id: '1624351572550045',
          state: State.Submitted,
        },
      },
    });

    // Set up the API mock after creating the request
    req.locals.api.getCaseById = jest.fn().mockResolvedValue({
      id: '1624351572550045',
      state: State.Submitted,
      applicantDocuments: mockApplicantDocuments,
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(req.locals.api.getCaseById).toHaveBeenCalledWith('1624351572550045');
    expect(res.locals.documents).toBeDefined();
    expect(res.locals.documents).toHaveLength(1);
    expect(res.locals.documents[0].name).toBe('test-document.pdf');
    expect(res.locals.documents[0].date).toBe('15/01/2024');
    expect(res.locals.hasDocuments).toBe(true);
    expect(res.locals.caseNumber).toBeDefined();
  });

  test('should load dashboard with DSS_Submitted case', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '1624351572550046',
          state: State.DSS_Submitted,
        },
      },
    });

    // Set up the API mock after creating the request
    req.locals.api.getCaseById = jest.fn().mockResolvedValue({
      id: '1624351572550046',
      state: State.DSS_Submitted,
      applicantDocuments: [],
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(req.locals.api.getCaseById).toHaveBeenCalledWith('1624351572550046');
    expect(res.locals.documents).toBeDefined();
    expect(res.locals.hasDocuments).toBe(false);
  });

  test('should handle errors and redirect to CICA lookup', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
      },
    });

    // Set up the API mock to reject
    req.locals.api.getCaseById = jest.fn().mockRejectedValue(new Error('API Error'));

    const res = mockResponse();

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CICA_LOOKUP);
    expect(req.locals.logger.error).toHaveBeenCalled();
  });

  test('should extract and format multiple documents from fresh API call', async () => {
    const mockApplicantDocuments = [
      {
        id: 'doc1',
        value: {
          documentLink: {
            document_url: 'http://dm-store/documents/11111111-1111-1111-1111-111111111111',
            document_filename: 'document-one.pdf',
            document_binary_url: 'http://dm-store/documents/11111111-1111-1111-1111-111111111111/binary',
          },
          documentCategory: 'ApplicationForm',
          date: '2024-03-10',
        },
      },
      {
        id: 'doc2',
        value: {
          documentLink: {
            document_url: 'http://dm-store/documents/22222222-2222-2222-2222-222222222222',
            document_filename: 'document-two.pdf',
            document_binary_url: 'http://dm-store/documents/22222222-2222-2222-2222-222222222222/binary',
          },
          documentCategory: 'Evidence',
          date: '2024-03-12',
        },
      },
      {
        id: 'doc3',
        value: {
          documentLink: {
            document_url: 'http://dm-store/documents/33333333-3333-3333-3333-333333333333',
            document_filename: 'document-three.pdf',
            document_binary_url: 'http://dm-store/documents/33333333-3333-3333-3333-333333333333/binary',
          },
          documentCategory: 'Decision',
          date: null,
        },
      },
    ];

    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
      },
    });

    // Set up the API mock after creating the request
    req.locals.api.getCaseById = jest.fn().mockResolvedValue({
      id: '123',
      state: State.Submitted,
      applicantDocuments: mockApplicantDocuments,
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(res.locals.documents).toHaveLength(3);
    expect(res.locals.documents[0].name).toBe('document-one.pdf');
    expect(res.locals.documents[0].date).toBe('10/03/2024');
    expect(res.locals.documents[1].name).toBe('document-two.pdf');
    expect(res.locals.documents[1].date).toBe('12/03/2024');
    expect(res.locals.documents[2].name).toBe('document-three.pdf');
    expect(res.locals.documents[2].date).toBeUndefined();
  });

  test('should handle case with no applicantDocuments field', async () => {
    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
      },
    });

    // Set up the API mock - applicantDocuments is undefined
    req.locals.api.getCaseById = jest.fn().mockResolvedValue({
      id: '123',
      state: State.Submitted,
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(res.locals.documents).toHaveLength(0);
    expect(res.locals.hasDocuments).toBe(false);
  });

  test('should create correct download URLs with document ID', async () => {
    const documentId = 'abcd1234-abcd-1234-abcd-1234abcd5678';
    const mockApplicantDocuments = [
      {
        id: 'doc1',
        value: {
          documentLink: {
            document_url: `http://dm-store/documents/${documentId}`,
            document_filename: 'my file.pdf',
            document_binary_url: `http://dm-store/documents/${documentId}/binary`,
          },
          documentCategory: 'ApplicationForm',
          date: '2024-01-01',
        },
      },
    ];

    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
      },
    });

    // Set up the API mock after creating the request
    req.locals.api.getCaseById = jest.fn().mockResolvedValue({
      id: '123',
      state: State.Submitted,
      applicantDocuments: mockApplicantDocuments,
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(res.locals.documents[0].downloadUrl).toContain('/dashboard/document/download');
    expect(res.locals.documents[0].downloadUrl).toContain(`documentId=${documentId}`);
    expect(res.locals.documents[0].downloadUrl).toContain(encodeURIComponent('my file.pdf'));
  });

  test('should skip documents without valid document ID in URL', async () => {
    const mockApplicantDocuments = [
      {
        id: 'doc1',
        value: {
          documentLink: {
            document_url: 'http://dm-store/invalid-url',
            document_filename: 'test.pdf',
          },
          documentCategory: 'ApplicationForm',
          date: '2024-01-01',
        },
      },
    ];

    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
      },
    });

    // Set up the API mock after creating the request
    req.locals.api.getCaseById = jest.fn().mockResolvedValue({
      id: '123',
      state: State.Submitted,
      applicantDocuments: mockApplicantDocuments,
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    // Document with invalid URL should be skipped
    expect(res.locals.documents).toHaveLength(0);
    expect(res.locals.hasDocuments).toBe(false);
  });

  test('should extract document ID from URL without /binary suffix', async () => {
    const documentId = 'eeee1111-eeee-1111-eeee-111122223333';
    const mockApplicantDocuments = [
      {
        id: 'doc1',
        value: {
          documentLink: {
            document_url: `http://dm-store/documents/${documentId}`,
            document_filename: 'test.pdf',
          },
          documentCategory: 'ApplicationForm',
          date: '2024-01-01',
        },
      },
    ];

    const req = mockRequest({
      session: {
        userCase: {
          id: '123',
          state: State.Submitted,
        },
      },
    });

    // Set up the API mock after creating the request
    req.locals.api.getCaseById = jest.fn().mockResolvedValue({
      id: '123',
      state: State.Submitted,
      applicantDocuments: mockApplicantDocuments,
    });

    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(res.locals.documents[0].downloadUrl).toContain(`documentId=${documentId}`);
  });
});
