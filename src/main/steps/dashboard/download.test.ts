import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';

import DocumentDownloadController from './download';

describe('DocumentDownloadController', () => {
  const controller = new DocumentDownloadController();

  test('should download document successfully via sptribs-case-api', async () => {
    let finishListener: (() => void) | undefined;
    const mockStream = {
      once: jest.fn(),
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
      },
      session: {
        validatedPostcode: 'SW1A 1AA',
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
    res.once = jest.fn().mockImplementation((event, listener) => {
      if (event === 'finish') {
        finishListener = listener;
      }
      return res;
    });

    await controller.get(req, res);
    finishListener?.();

    expect(req.locals.api.downloadDocument).toHaveBeenCalledWith(
      '1234',
      '12345678-1234-1234-1234-123456789012',
      'SW1A 1AA'
    );
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="test-document.pdf"');
    expect(mockStream.pipe).toHaveBeenCalledWith(res);
    expect(req.locals.logger.info).toHaveBeenCalledWith(
      'CICA dashboard journey event',
      expect.objectContaining({
        event: 'document_download_completed',
        outcome: 'success',
        journeyId: expect.any(String),
      })
    );
  });

  test('should return 400 if documentId is missing', async () => {
    const req = mockRequest({ query: {} });
    const res = mockResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Document ID is required');
  });

  test('should return 400 if userCase.id (ccdReference) is missing', async () => {
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
      },
      session: {
        userCase: null as any,
      },
    });
    const res = mockResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Case reference is required');
  });

  test('should return 401 if validatedPostcode is missing', async () => {
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
      },
      session: {
        validatedPostcode: undefined,
      },
    });
    const res = mockResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await controller.get(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('Unauthorized');
  });

  test('should handle download errors', async () => {
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
      },
      session: {
        validatedPostcode: 'SW1A 1AA',
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
      once: jest.fn(),
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
      },
      session: {
        validatedPostcode: 'SW1A 1AA',
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
    res.once = jest.fn().mockReturnValue(res);

    await controller.get(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="server-provided-name.pdf"'
    );
  });

  test('should use a safe default filename when the API filename contains invalid characters', async () => {
    const mockStream = {
      once: jest.fn(),
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
      },
      session: {
        validatedPostcode: 'SW1A 1AA',
      },
    });

    req.locals.api.downloadDocument = jest.fn().mockResolvedValue({
      data: mockStream,
      headers: {
        'content-type': 'application/pdf',
        'original-file-name': 'invalid/name.pdf',
      },
    });

    const res = mockResponse();
    res.setHeader = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();
    res.once = jest.fn().mockReturnValue(res);

    await controller.get(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="document"');
  });

  test('should use default filename if not provided by the API', async () => {
    const mockStream = {
      once: jest.fn(),
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
      },
      session: {
        validatedPostcode: 'SW1A 1AA',
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
    res.once = jest.fn().mockReturnValue(res);

    await controller.get(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="document"');
  });

  test('should use default content-type if not provided', async () => {
    const mockStream = {
      once: jest.fn(),
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: {
        documentId: '12345678-1234-1234-1234-123456789012',
      },
      session: {
        validatedPostcode: 'SW1A 1AA',
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
    res.once = jest.fn().mockReturnValue(res);

    await controller.get(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
  });

  test('should trace a source stream failure as a failed download', async () => {
    let streamErrorListener: ((error: Error) => void) | undefined;
    const mockStream = {
      once: jest.fn().mockImplementation((event, listener) => {
        if (event === 'error') {
          streamErrorListener = listener;
        }
      }),
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: { documentId: '12345678-1234-1234-1234-123456789012' },
      session: { validatedPostcode: 'SW1A 1AA' },
    });
    req.locals.api.downloadDocument = jest.fn().mockResolvedValue({
      data: mockStream,
      headers: { 'content-type': 'application/pdf' },
    });

    const res = mockResponse();
    res.setHeader = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();
    res.once = jest.fn().mockReturnValue(res);

    await controller.get(req, res);
    streamErrorListener?.(new Error('Stream failed'));

    expect(res.status).toHaveBeenCalledWith(500);
    expect(req.locals.logger.error).toHaveBeenCalledWith(
      'CICA dashboard journey event',
      expect.objectContaining({ event: 'document_download_failed', outcome: 'stream_error', errorType: 'Error' })
    );
  });

  test('should trace a client disconnect as an aborted download', async () => {
    let closeListener: (() => void) | undefined;
    const mockStream = {
      once: jest.fn(),
      pipe: jest.fn(),
    };
    const req = mockRequest({
      query: { documentId: '12345678-1234-1234-1234-123456789012' },
      session: { validatedPostcode: 'SW1A 1AA' },
    });
    req.locals.api.downloadDocument = jest.fn().mockResolvedValue({
      data: mockStream,
      headers: { 'content-type': 'application/pdf' },
    });

    const res = mockResponse();
    res.setHeader = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();
    (res as any).writableFinished = false;
    res.once = jest.fn().mockImplementation((event, listener) => {
      if (event === 'close') {
        closeListener = listener;
      }
      return res;
    });

    await controller.get(req, res);
    closeListener?.();

    expect(req.locals.logger.error).toHaveBeenCalledWith(
      'CICA dashboard journey event',
      expect.objectContaining({ event: 'document_download_aborted', outcome: 'client_disconnected' })
    );
  });
});
