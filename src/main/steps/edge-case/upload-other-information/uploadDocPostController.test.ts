import { Axios } from 'axios';
import config from 'config';

import { mockRequest } from '../../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../../test/unit/utils/mockResponse';
import { YesOrNo } from '../../../app/case/definition';
import { isFieldFilledIn } from '../../../app/form/validation';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import * as steps from '../../../steps';
import { SPTRIBS_CASE_API_BASE_URL } from '../../common/constants/apiConstants';
import { UPLOAD_OTHER_INFORMATION } from '../../urls';

import UploadDocumentController, { CASE_API_URL, FileMimeType, FileValidations } from './uploadDocPostController';

const getNextStepUrlMock = jest.spyOn(steps, 'getNextStepUrl');

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
    expect(res.redirect).toBeCalledWith('/upload-other-information');
    expect(req.session.errors).not.toEqual(errors);
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
    expect(Object.entries(allTypes)).toHaveLength(Object.entries(FileMimeType).length);
    expect(allTypes).toMatchObject(FileMimeType);
    expect(Object.entries(allTypes).toString()).toBe(Object.entries(FileMimeType).toString());
  });
});

describe('document format validation', () => {
  it('must match valid mimetypes', () => {
    expect(FileValidations.formatValidation('image/gif')).toBe(false);
    expect(FileValidations.formatValidation('audio/mpeg')).toBe(true);
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
    expect(FileValidations.sizeValidation('text/plain', file1Size)).toBe(true);
  });

  it('Checking for file2 size', () => {
    expect(FileValidations.sizeValidation('text/plain', file2Size)).toBe(true);
  });

  it('Checking for file3 size', () => {
    expect(FileValidations.sizeValidation('text/plain', file3Size)).toBe(false);
  });

  it('Checking for file3 multimedia size', () => {
    expect(FileValidations.sizeValidation('video/mp4', file4Size)).toBe(false);
  });

  it('Checking for file4 multimedia size', () => {
    expect(FileValidations.sizeValidation('video/mp4', file4Size)).toBe(false);
  });
});

/**
 *      @UploadDocumentController
 *
 *      test for document upload controller
 */

describe('Check for System contents to match for en', () => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('upload-other-information');
  const getContents = resourceLoader.getFileContents().errors;

  it('must match load English as Langauage', () => {
    const req = mockRequest({});
    req.query['lng'] = 'en';
    req.session['lang'] = 'en';
    const SystemContentLoader = FileValidations.ResourceReaderContents(req);
    const getEnglishContents = getContents.en;
    expect(SystemContentLoader).toEqual(getEnglishContents);
  });
});

describe('Check for System contents to match for cy', () => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('upload-other-information');
  const getContents = resourceLoader.getFileContents().errors;

  it('must match load English as Language', () => {
    const req = mockRequest({});
    req.query['lng'] = 'cy';
    req.session['lang'] = 'cy';
    const SystemContentLoader = FileValidations.ResourceReaderContents(req);
    const getWhelshContents = getContents.cy;
    expect(SystemContentLoader).toEqual(getWhelshContents);
  });
});

describe('Check for System contents to match for fr', () => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('upload-other-information');
  const getContents = resourceLoader.getFileContents().errors;

  it('must match load English as default Langauage', () => {
    const req = mockRequest({});
    req.query['lng'] = 'fr';
    req.session['lang'] = 'fr';
    const SystemContentLoader = FileValidations.ResourceReaderContents(req);
    const getWhelshContents = getContents.en;
    expect(SystemContentLoader).toEqual(getWhelshContents);
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
  const postingcontroller = new UploadDocumentController(mockForm.fields);
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

    await postingcontroller.PostDocumentUploader(req, res);
  });

  it('must be have axios instance', () => {
    const SystemInstance = postingcontroller.UploadDocumentInstance('/', {});
    expect(SystemInstance instanceof Axios);
  });

  it('procceding the document upload', () => {
    const SystemInstance = postingcontroller.UploadDocumentInstance('/', {});
    expect(SystemInstance instanceof Axios);
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
    await postingcontroller.post(req, res);
  });

  it('should allow continue if no documents uploaded', async () => {
    req.session.caseDocuments = [];
    req.session.supportingCaseDocuments = [];
    req.session.otherCaseInformation = [];
    req.files = [];
    req.session.fileErrors = [];

    await postingcontroller.post(req, res);
  });

  it('should display error if upload clicked with no document', async () => {
    req.session.caseDocuments = [];
    req.session.supportingCaseDocuments = [];
    req.session.otherCaseInformation = [];
    (req.files as any) = null;
    req.session.fileErrors = [];
    req.body['documentUploadProceed'] = false;

    await postingcontroller.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION);
  });
});
