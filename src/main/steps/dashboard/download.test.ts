import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';

import DocumentDownloadController from './download';

describe('DocumentDownloadController', () => {
  const controller = new DocumentDownloadController();

  test('should download document successfully via sptribs-case-api', async () => {
    const mockStream = {
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
        filename: 'test-document.pdf',
      },
    });

    // Set up the API mock after creating the request
    req.locals.api.downloadDocument = jest.fn().mockResolvedValue({
      data: mockStream,
      headers: {
        'content-type': 'application/pdf',
        'original-file-name': 'test-document.pdf',
      },
    });

    const res = mockResponse();
    res.setHeader = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(req.locals.api.downloadDocument).toHaveBeenCalledWith('12345678-1234-1234-1234-123456789012');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="test-document.pdf"');
    expect(mockStream.pipe).toHaveBeenCalledWith(res);
  });

  test('should return 400 if documentId is missing', async () => {
    const req = mockRequest({
      query: {
        filename: 'test-document.pdf',
      },
    });
    const res = mockResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Document ID is required');
  });

  test('should handle download errors', async () => {
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
        filename: 'test-document.pdf',
      },
    });

    // Set up the API mock to reject
    req.locals.api.downloadDocument = jest.fn().mockRejectedValue(new Error('Download failed'));

    const res = mockResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error downloading document');
    expect(req.locals.logger.error).toHaveBeenCalled();
  });

  test('should use original-file-name header from API response', async () => {
    const mockStream = {
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
      },
    });

    // Set up the API mock after creating the request
    req.locals.api.downloadDocument = jest.fn().mockResolvedValue({
      data: mockStream,
      headers: {
        'content-type': 'application/pdf',
        'original-file-name': 'server-provided-name.pdf',
      },
    });

    const res = mockResponse();
    res.setHeader = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="server-provided-name.pdf"'
    );
  });

  test('should use default filename if not provided in query or headers', async () => {
    const mockStream = {
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
      },
    });

    // Set up the API mock after creating the request
    req.locals.api.downloadDocument = jest.fn().mockResolvedValue({
      data: mockStream,
      headers: {
        'content-type': 'application/pdf',
      },
    });

    const res = mockResponse();
    res.setHeader = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="document"');
  });

  test('should use default content-type if not provided', async () => {
    const mockStream = {
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
        filename: 'test-document.pdf',
      },
    });

    // Set up the API mock after creating the request
    req.locals.api.downloadDocument = jest.fn().mockResolvedValue({
      data: mockStream,
      headers: {},
    });

    const res = mockResponse();
    res.setHeader = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
  });
});
