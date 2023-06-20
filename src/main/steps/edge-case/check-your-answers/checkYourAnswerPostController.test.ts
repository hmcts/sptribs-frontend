import config from 'config';

import { mockRequest } from '../../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../../test/unit/utils/mockResponse';
import { YesOrNo } from '../../../app/case/definition';
import { isFieldFilledIn } from '../../../app/form/validation';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import * as steps from '../../../steps';
import { SPTRIBS_CASE_API_BASE_URL } from '../../common/constants/apiConstants';
import { CHECK_YOUR_ANSWERS } from '../../urls';

import submitCaseController, { CASE_API_URL, FileValidations } from './checkYourAnswerPostController';

const getNextStepUrlMock = jest.spyOn(steps, 'getNextStepUrl');

describe('Submit case controller', () => {
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
    const controller = new submitCaseController(mockForm.fields);
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
    expect(res.redirect).toBeCalledWith('/check-your-answers');
    expect(req.session.errors).not.toEqual(errors);
  });

  describe('when there is an error in saving session', () => {
    test('should throw an error', async () => {
      const controller = new submitCaseController({});
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

describe('The url must match the config url', () => {
  it('must match baseURl', () => {
    expect(CASE_API_URL).toBe(config.get(SPTRIBS_CASE_API_BASE_URL));
  });
});

describe('Check for System contents to match for en', () => {
  const resourceLoader = new ResourceReader();
  resourceLoader.Loader('check-your-answers');
  const getContents = resourceLoader.getFileContents().errors;

  it('Must match load English as Langauage', () => {
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
  resourceLoader.Loader('check-your-answers');
  const getContents = resourceLoader.getFileContents().errors;

  it('Must match load English as Language', () => {
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
  resourceLoader.Loader('check-your-answers');
  const getContents = resourceLoader.getFileContents().errors;

  it('Must match load English as default Langauage', () => {
    const req = mockRequest({});
    req.query['lng'] = 'fr';
    req.session['lang'] = 'fr';
    const SystemContentLoader = FileValidations.ResourceReaderContents(req);
    const getWhelshContents = getContents.en;
    expect(SystemContentLoader).toEqual(getWhelshContents);
  });
});

describe('checking for the redirect of post check your answers', () => {
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
  const postingcontroller = new submitCaseController(mockForm.fields);

  it('should allow continue if no documents uploaded', async () => {
    req.session.fileErrors = [];
    await postingcontroller.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(CHECK_YOUR_ANSWERS);
  });
});
