import { mockRequest } from '../../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../../test/unit/utils/mockResponse';
import { YesOrNo } from '../../../app/case/definition';
import { FileValidations } from '../../../app/controller/UploadController';
import { DocumentManagementFile } from '../../../app/document/CaseDocumentManagementClient';
import { isFieldFilledIn } from '../../../app/form/validation';
import * as steps from '../../../steps';
import { UPLOAD_OTHER_INFORMATION, UPLOAD_SUPPORTING_DOCUMENTS } from '../../../steps/urls';

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
    expect(FileValidations.formatValidation('audio/mp4', controller.getAcceptedFileMimeType())).toBe(false);
    expect(FileValidations.formatValidation('video/mp4', controller.getAcceptedFileMimeType())).toBe(false);
    expect(FileValidations.formatValidation('audio/mpeg', controller.getAcceptedFileMimeType())).toBe(false);
  });
});

describe('Form upload controller', () => {
  afterEach(() => {
    getNextStepUrlMock.mockClear();
  });

  test('Should display error if incorrect file type document upload', async () => {
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

    const req = mockRequest({});
    const res = mockResponse();
    (req.files as any) = { documents: { mimetype: 'audio/mp4', size: 104857600 } };
    req.session.caseDocuments = [];
    await controller.post(req, res);

    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_SUPPORTING_DOCUMENTS);
    expect(req.session.fileErrors).toHaveLength(1);
    expect(req.session.fileErrors[0].text).toEqual(
      'This service only accepts files in the formats - MS Word, MS Excel, PDF, JPG, PNG, TXT, RTF'
    );
  });

  test('Should display error if incorrect file size document upload', async () => {
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

    const req = mockRequest({});
    const res = mockResponse();
    (req.files as any) = { documents: { mimetype: 'application/pdf', size: 104857601 } };
    req.session.caseDocuments = [];
    await controller.post(req, res);

    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_SUPPORTING_DOCUMENTS);
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
          values: [{ label: l => l.no, value: YesOrNo.YES }],
          validator: isFieldFilledIn,
        },
      },
      submit: {
        text: l => l.continue,
      },
    };
    const controller = new UploadDocumentController(mockForm.fields);

    const req = mockRequest({});
    const res = mockResponse();
    (req.files as any) = { documents: { mimetype: 'audio/mp4', size: 104857601 } };
    req.session.caseDocuments = [];
    await controller.post(req, res);

    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_SUPPORTING_DOCUMENTS);
    expect(req.session.fileErrors).toHaveLength(2);
    expect(req.session.fileErrors[0].text).toEqual(
      'File size exceeds the maximum permitted value. Upload a file that is less than 100 MB'
    );
    expect(req.session.fileErrors[1].text).toEqual(
      'This service only accepts files in the formats - MS Word, MS Excel, PDF, JPG, PNG, TXT, RTF'
    );
  });

  test('Should upload file successfully', async () => {
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
    req.session.supportingCaseDocuments = [];
    (req.files as any) = { documents: { name: 'test', mimetype: 'application/pdf', size: 20480000, data: 'data' } };
    req.session.fileErrors = [];
    req.body['documentUploadProceed'] = false;

    await controller.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_SUPPORTING_DOCUMENTS);
  });

  test('Should display error if upload file fails', async () => {
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
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_SUPPORTING_DOCUMENTS);
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

  const req = mockRequest({});
  const res = mockResponse();
  const postingController = new UploadDocumentController(mockForm.fields);
  it('continue to next page after the documents has been proccessed', async () => {
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
    ] as DocumentManagementFile[];
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
    ] as DocumentManagementFile[];
    await postingController.postDocumentUploader(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
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
    ] as DocumentManagementFile[];

    await postingController.postDocumentUploader(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_SUPPORTING_DOCUMENTS);
    expect(req.session.fileErrors).toHaveLength(1);
    expect(req.session.fileErrors[0].text).toEqual('Document upload or deletion has failed. Try again');
  });

  req.body['documentUploadProceed'] = true;
  req.session.supportingCaseDocuments = [];

  it('should redirect to same page if user continues with no documents uploaded', async () => {
    req.session.caseDocuments = [];
    req.session.supportingCaseDocuments = [];
    req.files = [];
    req.session.fileErrors = [];

    req.body['saveAndContinue'] = true;

    await postingController.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_SUPPORTING_DOCUMENTS);
    expect(req.session.fileErrors[0].text).toEqual(
      'You must upload supporting documentation before you can proceed further'
    );
  });

  it('should display error if upload file button clicked with no document', async () => {
    req.session.caseDocuments = [];
    req.session.supportingCaseDocuments = [];
    (req.files as any) = null;
    req.session.fileErrors = [];
    req.body['documentUploadProceed'] = false;

    delete req.body['saveAndContinue'];

    await postingController.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_SUPPORTING_DOCUMENTS);
    expect(req.session.fileErrors[0].text).toEqual('Choose a file to upload');
  });

  it('should display error if max documents have been uploaded', async () => {
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
    ] as DocumentManagementFile[];
    req.files = [{ originalname: 'uploaded-file.pdf' }] as unknown as Express.Multer.File[];
    req.session.fileErrors = [];

    delete req.body['saveAndContinue'];

    await postingController.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_SUPPORTING_DOCUMENTS);
    expect(req.session.fileErrors[0].text).toEqual(
      'You can upload 5 files only. Delete one of the uploaded files and retry'
    );
  });
});
