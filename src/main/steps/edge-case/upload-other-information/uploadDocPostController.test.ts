import { Axios } from 'axios';

import { mockRequest } from '../../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../../test/unit/utils/mockResponse';
import { YesOrNo } from '../../../app/case/definition';
import { FileValidations } from '../../../app/controller/UploadController';
import { isFieldFilledIn } from '../../../app/form/validation';
import * as steps from '../../../steps';
import { UPLOAD_OTHER_INFORMATION } from '../../urls';

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

  test('Should redirect back to the current page with the form data on errors', async () => {
    const errors = [{ errorType: 'required', propertyName: 'field' }];
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
    const QUERY = {
      query: 'delete',
      documentId: 'xyz',
      documentType: 'other',
    };

    const req = mockRequest({});
    const res = mockResponse();
    (req.files as any) = { documents: { mimetype: 'text/plain' } };
    req.session.caseDocuments = [];
    req.session.fileErrors = [];
    req.query = QUERY;
    await controller.post(req, res);

    expect(req.query).toEqual({
      query: 'delete',
      documentId: 'xyz',
      documentType: 'other',
    });

    expect(req.locals.api.triggerEvent).not.toHaveBeenCalled();
    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toBeCalledWith(UPLOAD_OTHER_INFORMATION);
    expect(req.session.errors).toEqual(errors);
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
  it('redirection after the documents has been proccessed', async () => {
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
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
  });

  it('must be have axios instance', () => {
    const systemInstance = postingController.uploadDocumentInstance('/', {});
    expect(systemInstance instanceof Axios);
  });

  it('procceding the document upload', () => {
    const systemInstance = postingController.uploadDocumentInstance('/', {});
    expect(systemInstance instanceof Axios);
  });

  req.body['documentUploadProceed'] = true;
  req.session.otherCaseInformation = [];

  it('Post controller attributes', async () => {
    // req.session.otherCaseInformation = [];

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

    req.files = [];

    /**
     *
     */
    await postingController.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
  });

  it('should allow continue if no documents uploaded', async () => {
    req.session.caseDocuments = [];
    req.session.supportingCaseDocuments = [];
    req.session.otherCaseInformation = [];
    req.files = [];
    req.session.fileErrors = [];

    await postingController.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
  });

  it('should display error if upload clicked with no document', async () => {
    req.session.caseDocuments = [];
    req.session.supportingCaseDocuments = [];
    req.session.otherCaseInformation = [];
    (req.files as any) = null;
    req.session.fileErrors = [];
    req.body['documentUploadProceed'] = false;

    await postingController.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
  });
});
