import { mockRequest } from '../../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../../test/unit/utils/mockResponse';
import { YesOrNo } from '../../../app/case/definition';
import { FileValidations } from '../../../app/controller/UploadController';
import { isFieldFilledIn } from '../../../app/form/validation';
import * as steps from '../../../steps';
import { EQUALITY, UPLOAD_OTHER_INFORMATION } from '../../urls';

import UploadDocumentController from './uploadDocPostController';

const getNextStepUrlMock = jest.spyOn(steps, 'getNextStepUrl');

describe('Document format validation', () => {
  it('must match valid mimetypes', () => {
    const mockForm = {
      fields: {
        field: {
          type: 'file',
          values: [{ label: l => l.no, value: YesOrNo.YES }],
          validator: isFieldFilledIn,
        },
      },
      submit: {
        text: l => l.continue,
      },
    };
    const controller = new UploadDocumentController(mockForm.fields);

    expect(FileValidations.formatValidation('image/gif', controller.getAcceptedFileMimeType())).toBe(false);
    expect(FileValidations.formatValidation('application/msword', controller.getAcceptedFileMimeType())).toBe(true);
    expect(
      FileValidations.formatValidation(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        controller.getAcceptedFileMimeType()
      )
    ).toBe(true);
    expect(FileValidations.formatValidation('application/pdf', controller.getAcceptedFileMimeType())).toBe(true);
    expect(FileValidations.formatValidation('image/png', controller.getAcceptedFileMimeType())).toBe(true);
    expect(FileValidations.formatValidation('application/vnd.ms-excel', controller.getAcceptedFileMimeType())).toBe(
      true
    );
    expect(
      FileValidations.formatValidation(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        controller.getAcceptedFileMimeType()
      )
    ).toBe(true);
    expect(FileValidations.formatValidation('image/jpeg', controller.getAcceptedFileMimeType())).toBe(true);
    expect(FileValidations.formatValidation('text/plain', controller.getAcceptedFileMimeType())).toBe(true);
    expect(FileValidations.formatValidation('application/rtf', controller.getAcceptedFileMimeType())).toBe(true);
    expect(FileValidations.formatValidation('text/rtf', controller.getAcceptedFileMimeType())).toBe(true);
    expect(FileValidations.formatValidation('audio/mp4', controller.getAcceptedFileMimeType())).toBe(true);
    expect(FileValidations.formatValidation('video/mp4', controller.getAcceptedFileMimeType())).toBe(true);
    expect(FileValidations.formatValidation('audio/mpeg', controller.getAcceptedFileMimeType())).toBe(true);
  });
});

describe('Document upload controller', () => {
  afterEach(() => {
    getNextStepUrlMock.mockClear();
  });

  test('Should display error if incorrect file type document upload', async () => {
    const mockForm = {
      fields: {
        documentRelevance: {
          type: 'file',
        },
      },
      submit: {
        text: l => l.continue,
      },
    };
    const controller = new UploadDocumentController(mockForm.fields);

    const req = mockRequest({});
    const res = mockResponse();
    (req.files as any) = { documents: { mimetype: 'image/gif', size: 20480000 } };
    req.session.caseDocuments = [];
    req.session.fileErrors = [];
    await controller.post(req, res);

    expect(req.locals.api.triggerEvent).not.toHaveBeenCalled();
    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
    expect(req.session.fileErrors).toHaveLength(1);
    expect(req.session.fileErrors[0].text).toEqual(
      'This service only accepts files in the formats - MS Word, MS Excel, PDF, JPG, PNG, TXT, RTF, MP4, MP3'
    );
  });

  test('Should display error if incorrect file size document upload', async () => {
    const mockForm = {
      fields: {
        field: {
          type: 'file',
        },
      },
      submit: {
        text: l => l.continue,
      },
    };
    const controller = new UploadDocumentController(mockForm.fields);

    const req = mockRequest({});
    const res = mockResponse();
    (req.files as any) = { documents: { mimetype: 'text/plain', size: 104857601 } };
    req.session.caseDocuments = [];
    req.session.fileErrors = [];
    await controller.post(req, res);

    expect(req.locals.api.triggerEvent).not.toHaveBeenCalled();
    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
    expect(req.session.fileErrors).toHaveLength(1);
    expect(req.session.fileErrors[0].text).toEqual(
      'File size exceeds the maximum permitted value. Upload a file that is less than 100 MB'
    );
  });

  test('Should display error if incorrect file type and file size document upload', async () => {
    const mockForm = {
      fields: {
        field: {
          type: 'file',
        },
      },
      submit: {
        text: l => l.continue,
      },
    };
    const controller = new UploadDocumentController(mockForm.fields);

    const req = mockRequest({});
    const res = mockResponse();
    (req.files as any) = { documents: { mimetype: 'image/gif', size: 104857601 } };
    req.session.caseDocuments = [];
    req.session.fileErrors = [];
    await controller.post(req, res);

    expect(req.locals.api.triggerEvent).not.toHaveBeenCalled();
    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
    expect(req.session.fileErrors).toHaveLength(2);
    expect(req.session.fileErrors[0].text).toEqual(
      'File size exceeds the maximum permitted value. Upload a file that is less than 100 MB'
    );
    expect(req.session.fileErrors[1].text).toEqual(
      'This service only accepts files in the formats - MS Word, MS Excel, PDF, JPG, PNG, TXT, RTF, MP4, MP3'
    );
  });

  test('Should upload file successfully', async () => {
    const mockForm = {
      fields: {
        field: {
          type: 'file',
        },
      },
      submit: {
        text: l => l.continue,
      },
    };
    const req = mockRequest({
      locals: {
        documentApi: {
          create: jest.fn(),
        },
      },
    });
    const res = mockResponse();
    const controller = new UploadDocumentController(mockForm.fields);
    const createMock = jest.spyOn(req.locals.documentApi, 'create');
    createMock.mockResolvedValue([
      {
        originalDocumentName: 'test.pdf',
        _links: {
          self: { href: 'http://localhost:8080/documents/1234' },
          binary: { href: 'http://localhost:8080/documents/1234/binary' },
          thumbnail: { href: 'http://localhost:8080/documents/1234/thumbnail' },
        },
      },
    ] as any);
    req.session.otherCaseInformation = [];
    (req.files as any) = { documents: { name: 'test', mimetype: 'application/pdf', size: 20480000, data: 'data' } };
    req.session.fileErrors = [];
    req.body['documentUploadProceed'] = false;

    await controller.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
    expect(req.session.fileErrors).toHaveLength(0);
    expect(req.session.otherCaseInformation).toHaveLength(1);
    expect(req.session.otherCaseInformation[0].originalDocumentName).toEqual('test.pdf');
  });

  test('Should display error if upload file fails', async () => {
    const mockForm = {
      fields: {
        field: {
          type: 'file',
        },
      },
      submit: {
        text: l => l.continue,
      },
    };
    const req = mockRequest({
      locals: {
        documentApi: {
          create: jest.fn(),
        },
      },
    });
    const res = mockResponse();
    const controller = new UploadDocumentController(mockForm.fields);
    const createMock = jest.spyOn(req.locals.documentApi, 'create');
    createMock.mockRejectedValue(new Error('mock error'));
    (req.files as any) = { documents: { name: 'test', mimetype: 'application/pdf', size: 20480000, data: 'data' } };
    req.session.fileErrors = [];
    req.body['documentUploadProceed'] = false;

    await controller.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
    expect(req.session.fileErrors[0].text).toEqual('Document upload or deletion has failed. Try again');
  });

  describe('when there is an error in saving session', () => {
    test('should throw an error', async () => {
      const controller = new UploadDocumentController({});
      const res = mockResponse();
      const req = mockRequest({
        session: {
          user: { email: 'test@example.com' },

          save: jest.fn(done => done('MOCK_ERROR')),
        },
      });
      try {
        await controller.post(req, res);
      } catch (err) {
        //eslint-disable-next-line jest/no-conditional-expect
        expect(err).not.toBe('MOCK_ERROR');
      }
    });
  });

  describe('when data contains markdown link', () => {
    test('should throw an error when documentRelevance contains markdown link', async () => {
      const res = mockResponse();
      const req = mockRequest({
        body: {
          documentRelevance: '[Click here](https://www.google.co.uk)',
          additionalInformation: 'some info',
        },
      });
      const controller = new UploadDocumentController({});

      await controller.post(req, res);

      expect(req.session.errors).toHaveLength(1);
      expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
    });

    test('should throw an error when additionalInformation contains markdown link', async () => {
      const res = mockResponse();
      const req = mockRequest({
        body: {
          documentRelevance: 'doc relevance',
          additionalInformation: '[Click here](https://www.google.co.uk)',
        },
      });
      const controller = new UploadDocumentController({});

      await controller.post(req, res);

      expect(req.session.errors).toHaveLength(1);
      expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
    });

    test('should throw an error if error encountered during session save', async () => {
      const controller = new UploadDocumentController({});
      const res = mockResponse();
      const req = mockRequest({
        body: {
          documentRelevance: 'doc relevance',
          additionalInformation: '[Click here](https://www.google.co.uk)',
        },
        session: {
          user: { email: 'test@example.com' },

          save: jest.fn(done => done('MOCK_ERROR')),
        },
      });
      try {
        await controller.post(req, res);
      } catch (err) {
        //eslint-disable-next-line jest/no-conditional-expect
        expect(err).toBe('MOCK_ERROR');
      }
    });
  });
});

describe('when data contains markdown link', () => {
  test('should throw an error when documentRelevance contains HTML', async () => {
    const res = mockResponse();
    const req = mockRequest({
      body: {
        documentRelevance: '<a>https://www.google.co.uk</a>)',
        additionalInformation: 'some info',
      },
    });
    const controller = new UploadDocumentController({});

    await controller.post(req, res);

    expect(req.session.errors).toHaveLength(1);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
  });

  test('should throw an error when additionalInformation contains HTML', async () => {
    const res = mockResponse();
    const req = mockRequest({
      body: {
        documentRelevance: 'doc relevance',
        additionalInformation: '<a>https://www.google.co.uk</a>',
      },
    });
    const controller = new UploadDocumentController({});

    await controller.post(req, res);

    expect(req.session.errors).toHaveLength(1);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
  });

  test('should throw an error if error encountered during session save', async () => {
    const controller = new UploadDocumentController({});
    const res = mockResponse();
    const req = mockRequest({
      body: {
        documentRelevance: 'doc relevance',
        additionalInformation: '<a>https://www.google.co.uk</a>',
      },
      session: {
        user: { email: 'test@example.com' },

        save: jest.fn(done => done('MOCK_ERROR')),
      },
    });
    try {
      await controller.post(req, res);
    } catch (err) {
      //eslint-disable-next-line jest/no-conditional-expect
      expect(err).toBe('MOCK_ERROR');
    }
  });
});

describe('checking for the redirect of post document upload', () => {
  const mockForm = {
    fields: {
      field: {
        type: 'file',
        values: [{ label: l => l.no, value: YesOrNo.YES }],
        validator: isFieldFilledIn,
      },
    },
    submit: {
      text: l => l.continue,
    },
  };

  let req;
  let res;
  let postingController;

  beforeEach(() => {
    req = mockRequest({});
    res = mockResponse();
    postingController = new UploadDocumentController(mockForm.fields);
  });

  it('continue to next page after the documents has been proccessed', async () => {
    req.session.otherCaseInformation = [
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

    await postingController.postDocumentUploader(req, res);
    expect(res.redirect).toHaveBeenCalledWith(EQUALITY);
    expect(req.session.fileErrors).toHaveLength(0);
  });


  it('should allow continue if no documents uploaded', async () => {
    req.body['documentUploadProceed'] = true;
    req.session.otherCaseInformation = [];

    req.session.caseDocuments = [];
    req.session.supportingCaseDocuments = [];
    req.session.otherCaseInformation = [];
    req.files = [];
    req.session.fileErrors = [];

    req.body['saveAndContinue'] = true;

    await postingController.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(EQUALITY);
    expect(req.session.fileErrors).toHaveLength(0);
  });

  it('Should return error after the documents proccess has failed', async () => {
    jest.spyOn(req.locals.api, 'triggerEvent').mockImplementation(() => {
      throw new Error();
    });
    req.session.supportingCaseDocuments = [
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

    await postingController.postDocumentUploader(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
    expect(req.session.fileErrors).toHaveLength(1);
    expect(req.session.fileErrors[0].text).toEqual('Document upload or deletion has failed. Try again');
  });

  it('should display error if upload file button clicked with no document', async () => {
    req.session.caseDocuments = [];
    req.session.supportingCaseDocuments = [];
    req.session.otherCaseInformation = [];
    (req.files as any) = null;
    req.session.fileErrors = [];
    req.body['documentUploadProceed'] = false;

    delete req.body['saveAndContinue'];

    await postingController.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
    expect(req.session.fileErrors[0].text).toEqual('Choose a file to upload');
  });

  it('should display error if max documents have been uploaded', async () => {
    req.session.otherCaseInformation = [
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
      {
        originalDocumentName: 'document3.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document4.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document5.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document6.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document7.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document8.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document9.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document10.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document11.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document12.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document13.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document14.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document15.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document16.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document17.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document18.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document19.docx',
        _links: {
          self: {
            href: 'http://dm-example/documents/ce6e2',
          },
          binary: {
            href: 'http://dm-example/documents/ce6e2/binary',
          },
        },
      },
      {
        originalDocumentName: 'document20.docx',
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
    req.session.supportingCaseDocuments = [];
    req.files = [{ originalname: 'uploaded-file.pdf' }] as unknown as Express.Multer.File[];
    req.session.fileErrors = [];

    delete req.body['saveAndContinue'];

    await postingController.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
    expect(req.session.fileErrors[0].text).toEqual(
      'You can upload 20 files only. Delete one of the uploaded files and retry'
    );
  });
});
