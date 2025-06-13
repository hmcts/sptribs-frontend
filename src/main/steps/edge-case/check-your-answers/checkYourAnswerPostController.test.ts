import axios from 'axios';

import { mockRequest } from '../../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../../test/unit/utils/mockResponse';
import { CITIZEN_CIC_SUBMIT_CASE, LanguagePreference, YesOrNo } from '../../../app/case/definition';
import { isFieldFilledIn } from '../../../app/form/validation';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import * as steps from '../../../steps';
import { APPLICATION_SUBMITTED, CHECK_YOUR_ANSWERS } from '../../urls';

import submitCaseController, { FileValidations } from './checkYourAnswerPostController';

const getNextStepUrlMock = jest.spyOn(steps, 'getNextStepUrl');

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.create = jest.fn(() => mockedAxios);

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
    (req.locals.api.triggerEvent as any).mockRejectedValueOnce({
      status: 500,
    });
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

    expect(req.locals.api.triggerEvent).toHaveBeenCalledWith(
      req.session.userCase.id,
      { languagePreference: LanguagePreference.ENGLISH },
      CITIZEN_CIC_SUBMIT_CASE
    );
    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(CHECK_YOUR_ANSWERS);
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
        expect(err).toBe('MOCK_ERROR');
      }
    });
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

describe('LanguagePreference passed to Case API for email notifications', () => {
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
  const postController = new submitCaseController(mockForm.fields);

  it('should pass english as LanguagePreference if not set on session', async () => {
    await postController.post(req, res);

    expect(req.locals.api.triggerEvent).toHaveBeenCalledWith(
      req.session.userCase.id,
      {
        languagePreference: LanguagePreference.ENGLISH,
      },
      CITIZEN_CIC_SUBMIT_CASE
    );
    expect(res.redirect).toHaveBeenCalledWith(APPLICATION_SUBMITTED);
  });

  it('should pass welsh as LanguagePreference if welsh set on lang session variable', async () => {
    req.session.lang = 'cy';

    await postController.post(req, res);
    expect(req.locals.api.triggerEvent).toHaveBeenCalledWith(
      req.session.userCase.id,
      {
        languagePreference: LanguagePreference.WELSH,
      },
      CITIZEN_CIC_SUBMIT_CASE
    );

    expect(res.redirect).toHaveBeenCalledWith(APPLICATION_SUBMITTED);
  });
});
