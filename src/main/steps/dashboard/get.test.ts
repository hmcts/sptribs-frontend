import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { State } from '../../app/case/definition';
import { SUBJECT_DETAILS } from '../urls';

import DashboardGetController from './get';

jest.mock('../../app/controller/GetController');

describe('DashboardGetController', () => {
  const controller = new DashboardGetController();

  const mockCases = [
    {
      id: '1624351572550045',
      state: State.Submitted,
      tribunalFormDocuments: [
        {
          id: 'doc1',
          value: {
            documentLink: {
              document_url: 'http://example.com/doc1',
              document_filename: 'test-document.pdf',
              document_binary_url: 'http://example.com/doc1/binary',
            },
            comment: 'Test comment',
          },
        },
      ],
      supportingDocuments: [],
      otherInfoDocuments: [],
    },
    {
      id: '1624351572550046',
      state: State.DSS_Submitted,
      tribunalFormDocuments: [],
      supportingDocuments: [
        {
          id: 'doc2',
          value: {
            documentLink: {
              document_url: 'http://example.com/doc2',
              document_filename: 'supporting-doc.pdf',
              document_binary_url: 'http://example.com/doc2/binary',
            },
            comment: null,
          },
        },
      ],
      otherInfoDocuments: [],
    },
  ];

  test('should redirect to subject details if no submitted cases found', async () => {
    const req = mockRequest({
      locals: {
        api: {
          getCasesByUserId: jest.fn().mockResolvedValue([
            {
              id: '123',
              state: State.Draft,
              tribunalFormDocuments: [],
              supportingDocuments: [],
              otherInfoDocuments: [],
            },
          ]),
        },
      },
    });
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(SUBJECT_DETAILS);
  });

  test('should redirect to subject details if no cases found', async () => {
    const req = mockRequest({
      locals: {
        api: {
          getCasesByUserId: jest.fn().mockResolvedValue([]),
        },
      },
    });
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(SUBJECT_DETAILS);
  });

  test('should load dashboard with latest submitted case and documents', async () => {
    const req = mockRequest({
      locals: {
        api: {
          getCasesByUserId: jest.fn().mockResolvedValue(mockCases),
        },
      },
    });
    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(req.locals.api.getCasesByUserId).toHaveBeenCalledWith('123456');
    expect(req.session.userCase).toEqual(mockCases[0]);
    expect(res.locals.documents).toBeDefined();
    expect(res.locals.hasDocuments).toBe(true);
    expect(res.locals.caseNumber).toBeDefined();
  });

  test('should handle errors and redirect to subject details', async () => {
    const req = mockRequest({
      locals: {
        api: {
          getCasesByUserId: jest.fn().mockRejectedValue(new Error('API Error')),
        },
        logger: {
          error: jest.fn(),
        },
      },
    });
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(SUBJECT_DETAILS);
    expect(req.locals.logger.error).toHaveBeenCalled();
  });

  test('should extract and format all document types', async () => {
    const req = mockRequest({
      locals: {
        api: {
          getCasesByUserId: jest.fn().mockResolvedValue([
            {
              id: '123',
              state: State.Submitted,
              tribunalFormDocuments: [
                {
                  id: 'doc1',
                  value: {
                    documentLink: {
                      document_url: 'http://example.com/doc1',
                      document_filename: 'tribunal-doc.pdf',
                      document_binary_url: 'http://example.com/doc1/binary',
                    },
                    comment: 'Tribunal comment',
                  },
                },
              ],
              supportingDocuments: [
                {
                  id: 'doc2',
                  value: {
                    documentLink: {
                      document_url: 'http://example.com/doc2',
                      document_filename: 'supporting-doc.pdf',
                      document_binary_url: 'http://example.com/doc2/binary',
                    },
                    comment: null,
                  },
                },
              ],
              otherInfoDocuments: [
                {
                  id: 'doc3',
                  value: {
                    documentLink: {
                      document_url: 'http://example.com/doc3',
                      document_filename: 'other-doc.pdf',
                      document_binary_url: 'http://example.com/doc3/binary',
                    },
                    comment: 'Other comment',
                  },
                },
              ],
            },
          ]),
        },
      },
    });
    const res = mockResponse();
    res.locals = {};
    res.render = jest.fn().mockImplementation(() => {});

    await controller.get(req, res);

    expect(res.locals.documents).toHaveLength(3);
    expect(res.locals.documents[0].name).toBe('tribunal-doc.pdf');
    expect(res.locals.documents[1].name).toBe('supporting-doc.pdf');
    expect(res.locals.documents[2].name).toBe('other-doc.pdf');
  });
});
