import axios, { RawAxiosRequestHeaders } from 'axios';
import config from 'config';

import { ResourceReader } from '../../../main/modules/resourcereader/ResourceReader';
import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { mockUserCase4, mockUserCase4Output } from '../../../test/unit/utils/mockUserCase';
import { getServiceAuthToken } from '../../app/auth/service/get-service-auth-token';
import * as steps from '../../steps';
import { SPTRIBS_CASE_API_BASE_URL } from '../../steps/common/constants/apiConstants';
import UploadDocumentController from '../../steps/edge-case/upload-other-information/uploadDocPostController';
import { UPLOAD_OTHER_INFORMATION } from '../../steps/urls';
import { YesOrNo } from '../case/definition';
import { isFieldFilledIn } from '../form/validation';

import { CASE_API_URL, FileValidations, UploadController } from './UploadController';

const getNextStepUrlMock = jest.spyOn(steps, 'getNextStepUrl');
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.create = jest.fn(() => mockedAxios);
describe('PostController', () => {
  afterEach(() => {
    getNextStepUrlMock.mockClear();
  });

  const testCurrentPageRedirectUrl = 'upload-appeal-form';

  describe('All of the listed Validation for files should be in place', () => {
    const allTypes = {
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pdf: 'application/pdf',
      png: 'image/png',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      jpg: 'image/jpeg',
      txt: 'text/plain',
      rtf: 'application/rtf',
      rtf2: 'text/rtf',
      mp4audio: 'audio/mp4',
      mp4video: 'video/mp4',
      mp3: 'audio/mpeg',
    };

    it('must match the file validations type', () => {
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
      const controller = new UploadController(mockForm.fields);

      expect(Object.entries(allTypes)).toHaveLength(Object.entries(controller.getAcceptedFileMimeType()).length);
      expect(allTypes).toMatchObject(controller.getAcceptedFileMimeType());
      expect(Object.entries(allTypes).toString()).toBe(Object.entries(controller.getAcceptedFileMimeType()).toString());
      expect(typeof mockForm.fields).toBe('object');
    });

    describe('document format validation', () => {
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
        const controller = new UploadController(mockForm.fields);

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

    describe('The url must match the config url', () => {
      it('must match baseURl', () => {
        expect(CASE_API_URL).toBe(config.get(SPTRIBS_CASE_API_BASE_URL));
      });
    });

    describe('Checking for file upload size', () => {
      const file1Size = 10000000;
      const file2Size = 20000000;
      const file3Size = 700000001;
      const file4Size = 1000000001;
      it('Checking for file1 size', () => {
        expect(FileValidations.sizeValidation(file1Size)).toBe(true);
      });

      it('Checking for file2 size', () => {
        expect(FileValidations.sizeValidation(file2Size)).toBe(true);
      });

      it('Checking for file3 size', () => {
        expect(FileValidations.sizeValidation(file3Size)).toBe(false);
      });

      it('Checking for file3 multimedia size', () => {
        expect(FileValidations.sizeValidation(file4Size)).toBe(false);
      });

      it('Checking for file4 multimedia size', () => {
        expect(FileValidations.sizeValidation(file4Size)).toBe(false);
      });
    });

    /**
     *      @UploadDocumentController
     *
     *      test for document upload controller
     */

    describe('Check for System contents to match for en', () => {
      const resourceLoader = new ResourceReader();
      resourceLoader.Loader(testCurrentPageRedirectUrl);
      const getContents = resourceLoader.getFileContents().errors;

      it('must match load English as Language', () => {
        const req = mockRequest({});
        req.query['lng'] = 'en';
        req.session['lang'] = 'en';
        const SystemContentLoader = FileValidations.ResourceReaderContents(req, testCurrentPageRedirectUrl);
        const getEnglishContents = getContents.en;
        expect(SystemContentLoader).toEqual(getEnglishContents);
      });
    });

    describe('Check for System contents to match for cy', () => {
      const resourceLoader = new ResourceReader();
      resourceLoader.Loader(testCurrentPageRedirectUrl);
      const getContents = resourceLoader.getFileContents().errors;

      it('must match load Welsh as Language', () => {
        const req = mockRequest({});
        req.query['lng'] = 'cy';
        req.session['lang'] = 'cy';
        const SystemContentLoader = FileValidations.ResourceReaderContents(req, testCurrentPageRedirectUrl);
        const getWelshContents = getContents.cy;
        expect(SystemContentLoader).toEqual(getWelshContents);
      });
    });

    describe('Check for System contents to match for fr', () => {
      const resourceLoader = new ResourceReader();
      resourceLoader.Loader(testCurrentPageRedirectUrl);
      const getContents = resourceLoader.getFileContents().errors;

      it('must match load English as default Language', () => {
        const req = mockRequest({});
        req.query['lng'] = 'fr';
        req.session['lang'] = 'fr';
        const SystemContentLoader = FileValidations.ResourceReaderContents(req, testCurrentPageRedirectUrl);
        const getEnglishContents = getContents.en;
        expect(SystemContentLoader).toEqual(getEnglishContents);
      });
    });
  });

  test('Check error is thrown when no property exists for case documents', async () => {
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
    const controller = new UploadController(mockForm.fields);
    const req = mockRequest({});
    const res = mockResponse();

    delete req.session.caseDocuments;

    await controller.postDocumentUploader(req, res);
    expect(req.session.fileErrors).toHaveLength(1);
    expect(req.session.fileErrors[0].text).toEqual('You cannot continue without uploading the application');
    expect(req.session.fileErrors[0].href).toEqual('#file-upload-1');
    expect(res.redirect).toHaveBeenCalledWith('/' + testCurrentPageRedirectUrl);
  });

  test('Should upload additional document with document relevance successfully', async () => {
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
    const req = mockRequest({});
    const res = mockResponse();
    mockedAxios.post.mockResolvedValueOnce({ data: { document: { fileName: 'test' } } });
    const controller = new UploadDocumentController(mockForm.fields);
    req.session.otherCaseInformation = [];
    (req.files as any) = { documents: { name: 'test', mimetype: 'application/pdf', size: 20480000, data: 'data' } };
    req.body.documentRelevance = 'this is an important document';
    req.session.fileErrors = [];
    req.body['documentUploadProceed'] = false;

    await controller.post(req, res);
    expect(mockedAxios.create).toHaveBeenCalled();
    expect(mockedAxios.post).toHaveBeenCalled();
    expect(req.session.fileErrors).toHaveLength(0);
    expect(req.session.otherCaseInformation).toHaveLength(1);
    expect(req.session.otherCaseInformation[0]).toHaveProperty('description');
    expect(req.session.otherCaseInformation[0]).toEqual({
      description: 'this is an important document',
      fileName: 'test',
    });
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
  });

  test('Should pass additional document information to axios', async () => {
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

    const req = mockRequest({ userCase: mockUserCase4 });
    const res = mockResponse();
    const controller = new UploadDocumentController(mockForm.fields);
    (req.files as any) = { documents: { name: 'test', mimetype: 'application/pdf', size: 20480000, data: 'data' } };

    //req.body.documentRelevance = 'this is an important document';
    req.session.caseDocuments = [
      {
        url: 'url',
        fileName: 'fileName',
        documentId: 'documentId',
        binaryUrl: 'binaryUrl',
      },
    ];
    req.session.supportingCaseDocuments = [
      {
        url: 'url',
        fileName: 'fileName',
        documentId: 'documentId',
        binaryUrl: 'binaryUrl',
      },
    ];
    req.session.otherCaseInformation = [
      {
        url: 'url',
        fileName: 'fileName',
        documentId: 'documentId',
        binaryUrl: 'binaryUrl',
        description: 'this is an important document',
      },
    ];

    const headers: RawAxiosRequestHeaders = {
      authorization: `Bearer ${req.session.user['accessToken']}`,
      serviceAuthorization: getServiceAuthToken(),
    };
    const baseUrl = '/case/dss-orchestration/' + req.session.userCase.id + '/update?event=UPDATE';

    const TribunalFormDocuments = [
      {
        id: 'documentId',
        value: {
          documentLink: {
            document_url: 'url',
            document_filename: 'fileName',
            document_binary_url: 'binaryUrl',
          },
        },
      },
    ];
    const SupportingDocuments = [
      {
        id: 'documentId',
        value: {
          documentLink: {
            document_url: 'url',
            document_filename: 'fileName',
            document_binary_url: 'binaryUrl',
          },
        },
      },
    ];
    const OtherInfoDocuments = [
      {
        id: 'documentId',
        value: {
          documentLink: {
            document_url: 'url',
            document_filename: 'fileName',
            document_binary_url: 'binaryUrl',
          },
          comment: 'this is an important document',
        },
      },
    ];

    const responseBody = {
      ...mockUserCase4Output,
      TribunalFormDocuments,
      SupportingDocuments,
      OtherInfoDocuments,
    };

    req.body['documentUploadProceed'] = true;
    await controller.post(req, res);

    expect(
      axios.create({
        baseURL: config.get(SPTRIBS_CASE_API_BASE_URL),
        headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }).put
    ).toHaveBeenCalledWith(baseUrl, responseBody);
  });
});
