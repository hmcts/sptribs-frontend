import { Axios } from 'axios';
import config from 'config';

import { mockRequest } from '../../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../../test/unit/utils/mockResponse';
import { YesOrNo } from '../../../app/case/definition';
import { isFieldFilledIn } from '../../../app/form/validation';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import * as steps from '../../../steps';
import { UPLOAD_APPEAL_FORM } from '../../../steps/urls';
import { SPTRIBS_CASE_API_BASE_URL } from '../../common/constants/apiConstants';

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
      documentType: 'tribunalform',
    };

    const req = mockRequest({});
    const res = mockResponse();
    (req.files as any) = { documents: {} };
    req.session.caseDocuments = [];
    req.session.fileErrors = [];
    req.query = QUERY;
    await controller.post(req, res);

    expect(req.query).toEqual({
      query: 'delete',
      documentId: 'xyz',
      documentType: 'tribunalform',
    });

    expect(req.locals.api.triggerEvent).not.toHaveBeenCalled();
    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toBeCalledWith('/upload-appeal-form');
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
  const file3Size = 70000001;
  it('Checking for file1 size', () => {
    expect(FileValidations.sizeValidation(file1Size)).toBe(true);
  });

  it('Checking for file2 size', () => {
    expect(FileValidations.sizeValidation(file2Size)).toBe(true);
  });

  it('Checking for file3 size', () => {
    expect(FileValidations.sizeValidation(file3Size)).toBe(false);
  });
});

/**
 *      @UploadDocumentController
 *
 *      test for document upload controller
 */

describe('Check for System contents to match for en', () => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('upload-appeal-form');
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
  resourceLoader.Loader('upload-appeal-form');
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
  resourceLoader.Loader('upload-appeal-form');
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
    ];

    await postingcontroller.PostDocumentUploader(req, res);
    expect(res.redirect).toHaveBeenCalledWith('/upload-appeal-form');
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
  req.session.caseDocuments = [];

  it('Post controller attributes', async () => {
    // req.session.caseDocuments = [];

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

    req.files = [];

    /**
     *
     */
    await postingcontroller.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_APPEAL_FORM);
  });

  it('should redirect to same page if no documents uploaded', async () => {
    req.session.caseDocuments = [];
    req.session.supportingCaseDocuments = [];
    req.files = [];
    req.session.fileErrors = [];

    await postingcontroller.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_APPEAL_FORM);
  });

  it('should display error if upload clicked with no document', async () => {
    req.session.caseDocuments = [];
    req.session.supportingCaseDocuments = [];
    (req.files as any) = null;
    req.session.fileErrors = [];
    req.body['documentUploadProceed'] = false;

    await postingcontroller.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(UPLOAD_APPEAL_FORM);
  });
});
