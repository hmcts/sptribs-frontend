import { Application } from 'express';
import fileUpload from 'express-fileupload';

import { FileUpload } from './index';

jest.mock('express-fileupload');

describe('FileUpload', () => {
  let mockApp: Application;

  beforeEach(() => {
    mockApp = {} as Application;
    mockApp.use = jest.fn(); // Mocking the 'use' method of the app object
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockApp = {} as Application;
  });

  it('should enable file upload for the application', () => {
    const fileUploadMock = fileUpload as jest.Mocked<typeof fileUpload>;
    const mockFileUploadMiddleware = jest.fn();
    fileUploadMock.mockReturnValue(mockFileUploadMiddleware);

    const fileUploadInstance = new FileUpload();
    fileUploadInstance.enableFor(mockApp);

    expect(fileUploadMock).toHaveBeenCalledWith({
      limits: { fileSize: 1024 * 1024 * 101 },
    });
    expect(mockApp.use).toHaveBeenCalledWith(mockFileUploadMiddleware);
  });
});
