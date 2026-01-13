import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';

import DocumentDownloadController from './download';

describe('DocumentDownloadController', () => {
  const controller = new DocumentDownloadController();

  test('should download document successfully', async () => {
    const mockStream = {
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: {
        url: 'http://example.com/document/binary',
        filename: 'test-document.pdf',
      },
      locals: {
        documentApi: {
          downloadDocument: jest.fn().mockResolvedValue({
            data: mockStream,
            headers: {
              'content-type': 'application/pdf',
            },
          }),
        },
        logger: {
          error: jest.fn(),
        },
      },
    });
    const res = mockResponse();
    res.setHeader = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(req.locals.documentApi.downloadDocument).toHaveBeenCalledWith('http://example.com/document/binary');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="test-document.pdf"');
    expect(mockStream.pipe).toHaveBeenCalledWith(res);
  });

  test('should return 400 if URL is missing', async () => {
    const req = mockRequest({
      query: {
        filename: 'test-document.pdf',
      },
      locals: {
        logger: {
          error: jest.fn(),
        },
      },
    });
    const res = mockResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Document URL is required');
  });

  test('should handle download errors', async () => {
    const req = mockRequest({
      query: {
        url: 'http://example.com/document/binary',
        filename: 'test-document.pdf',
      },
      locals: {
        documentApi: {
          downloadDocument: jest.fn().mockRejectedValue(new Error('Download failed')),
        },
        logger: {
          error: jest.fn(),
        },
      },
    });
    const res = mockResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error downloading document');
    expect(req.locals.logger.error).toHaveBeenCalled();
  });

  test('should use default filename if not provided', async () => {
    const mockStream = {
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: {
        url: 'http://example.com/document/binary',
      },
      locals: {
        documentApi: {
          downloadDocument: jest.fn().mockResolvedValue({
            data: mockStream,
            headers: {
              'content-type': 'application/pdf',
            },
          }),
        },
        logger: {
          error: jest.fn(),
        },
      },
    });
    const res = mockResponse();
    res.setHeader = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="document"');
  });
});
