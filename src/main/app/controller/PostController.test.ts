import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { FormContent } from '../../app/form/Form';
import * as steps from '../../steps';
import { CICA_REFERENCE_NUMBER, CONTACT_DETAILS, SUBJECT_CONTACT_DETAILS } from '../../steps/urls'; //TOOK out CONTACT_DETAILS for EMAIL_ADDRESS RB
import { CITIZEN_CIC_CREATE_CASE, CITIZEN_CIC_SUBMIT_CASE, CITIZEN_CIC_UPDATE_CASE } from '../case/definition';
import { isPhoneNoValid } from '../form/validation';

import { AppRequest } from './AppRequest';
import { PostController } from './PostController';

const getNextStepUrlMock = jest.spyOn(steps, 'getNextStepUrl');

describe('PostController', () => {
  afterEach(() => {
    getNextStepUrlMock.mockClear();
  });

  const mockFormContent = {
    fields: {},
  } as unknown as FormContent;

  test('Should redirect back to the current page with the form data on errors', async () => {
    const errors = [{ propertyName: 'applicant1PhoneNumber', errorType: 'invalid' }];
    const body = { applicant1PhoneNumber: 'invalid phone number' };
    const mockPhoneNumberFormContent = {
      fields: {
        applicant1PhoneNumber: {
          type: 'tel',
          validator: isPhoneNoValid,
        },
      },
    } as unknown as FormContent;
    const controller = new PostController(mockPhoneNumberFormContent.fields);

    const req = mockRequest({ body });
    const res = mockResponse();
    await controller.post(req, res);

    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(req.path);
    expect(req.session.errors).toEqual(errors);
  });

  test('Should save the users data, update session case from API response and redirect to the next page if the form is valid', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = { MOCK_KEY: 'MOCK_VALUE' };
    const controller = new PostController(mockFormContent.fields);

    const expectedUserCase = {
      id: '1234',
      MOCK_KEY: 'MOCK_VALUE',
    };

    const req = mockRequest({ body });
    req.originalUrl = CONTACT_DETAILS;
    (req.locals.api.triggerEvent as jest.Mock).mockResolvedValueOnce(expectedUserCase);
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual(expectedUserCase);
    expect(getNextStepUrlMock).toHaveBeenCalledWith(req, expectedUserCase);
    expect(controller.getEventName(req)).toEqual('citizen-cic-update-dss-application');
    expect(req.locals.api.triggerEvent as jest.Mock).toHaveBeenCalledWith(
      '1234',
      { MOCK_KEY: 'MOCK_VALUE', representation: 'No' },
      'citizen-cic-update-dss-application'
    );
    expect(req.session.errors).toStrictEqual([]);
  });

  test('Should save the users data, update session case from API response and redirect to the next page if the form is valid and the user has representation', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = { MOCK_KEY: 'MOCK_VALUE', representation: 'Yes' };
    const controller = new PostController(mockFormContent.fields);

    const expectedUserCase = {
      id: '1234',
      MOCK_KEY: 'MOCK_VALUE',
      representation: 'Yes',
    };

    const req = mockRequest({ body });
    req.originalUrl = CONTACT_DETAILS;
    (req.locals.api.triggerEvent as jest.Mock).mockResolvedValueOnce(expectedUserCase);
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual(expectedUserCase);
    expect(getNextStepUrlMock).toHaveBeenCalledWith(req, expectedUserCase);
    expect(controller.getEventName(req)).toEqual('citizen-cic-update-dss-application');
    expect(req.locals.api.triggerEvent as jest.Mock).toHaveBeenCalledWith(
      '1234',
      { MOCK_KEY: 'MOCK_VALUE', representation: 'Yes' },
      'citizen-cic-update-dss-application'
    );
    expect(req.session.errors).toStrictEqual([]);
  });

  it('redirects back to the current page with a session error if there was an problem saving data', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE' };
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body });
    (req.locals.api.triggerEvent as jest.Mock).mockRejectedValueOnce('Error saving');
    // const logger = req.locals.logger as unknown as MockedLogger;
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual({
      id: '1234',
      MOCK_KEY: 'MOCK_VALUE',
    });
  });

  it('Case create test', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', originalUrl: SUBJECT_CONTACT_DETAILS };
    const controller = new PostController(mockFormContent.fields);
    const req = mockRequest({ body });
    req.session.userCase.id = '';
    req.originalUrl = SUBJECT_CONTACT_DETAILS;
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual({
      id: '',
      MOCK_KEY: 'MOCK_VALUE',
      originalUrl: '/subject-contact-details',
    });
  });

  it('Case update test', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', originalUrl: SUBJECT_CONTACT_DETAILS };
    const controller = new PostController(mockFormContent.fields);
    const req = mockRequest({ body });
    req.originalUrl = SUBJECT_CONTACT_DETAILS;
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual({
      id: '1234',
      MOCK_KEY: 'MOCK_VALUE',
      originalUrl: '/subject-contact-details',
    });
  });

  test('rejects with an error when unable to save session data', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = { MOCK_KEY: 'MOCK_VALUE' };
    const controller = new PostController(mockFormContent.fields);

    const mockSave = jest.fn(done => done('An error while saving session'));
    const req = mockRequest({ body, session: { save: mockSave } });
    (req.locals.api.triggerEvent as jest.Mock).mockResolvedValueOnce({ MOCK_KEY: 'MOCK_VALUE' });
    const res = mockResponse();
    await expect(controller.post(req, res)).rejects.toEqual('An error while saving session');

    const userCase = {
      ...req.session.userCase,
      ...body,
    };
    expect(mockSave).toHaveBeenCalled();
    expect(getNextStepUrlMock).toHaveBeenCalledWith(req, userCase);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(req.session.errors).toStrictEqual([]);
  });

  test('Should save the users data and redirect to the next page if the form is valid with parsed body', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = { day: '1', month: '1', year: '2000' };
    const controller = new PostController(mockFormContent.fields);

    const expectedUserCase = {
      id: '1234',
      day: '1',
      month: '1',
      year: '2000',
    };

    const req = mockRequest({ body });
    (req.locals.api.triggerEvent as jest.Mock).mockResolvedValueOnce(expectedUserCase);
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual(expectedUserCase);
  });

  it('saves and signs out even if there are errors', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', saveAndSignOut: true };
    const controller = new PostController(mockFormContent.fields);
    const req = mockRequest({ body, session: { user: { email: 'test@example.com' } } });
    const res = mockResponse();
    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/save-and-sign-out');
  });

  it('saves and signs out even if was an error saving data', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', saveAndSignOut: true };
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body, session: { user: { email: 'test@example.com' } } });
    (req.locals.api.triggerEvent as jest.Mock).mockRejectedValue('Error saving');
    const res = mockResponse();
    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/save-and-sign-out');
  });

  it('when user clicks on cancel button response should be redirected to UK GOV Home page', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', cancel: true };
    const controller = new PostController(mockFormContent.fields);
    const req = mockRequest({ body, session: { user: { email: 'test@example.com' } } });
    const res = mockResponse();
    await controller.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(
      'https://www.gov.uk/government/organisations/hm-courts-and-tribunals-service'
    );
  });

  test('triggers citizen-draft-aos event if user is respondent', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = {};
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body });
    const res = mockResponse();
    await controller.post(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/next-step-url');
  });

  test('whether the citizen update call is made with the expected user data', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = { MOCK_KEY: 'MOCK_VALUE' };
    const controller = new PostController(mockFormContent.fields);

    const expectedUserCase = {
      id: '1234',
      MOCK_KEY: 'MOCK_VALUE',
    };

    const req = mockRequest({ body });
    (req.locals.api.triggerEvent as jest.Mock).mockResolvedValueOnce(expectedUserCase);
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual(expectedUserCase);
    expect(getNextStepUrlMock).toHaveBeenCalledWith(req, expectedUserCase);
    expect(res.redirect).toHaveBeenCalledWith('/next-step-url');
    expect(req.session.errors).toStrictEqual([]);
  });

  test('Should save the users data and end response for session timeout', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', saveBeforeSessionTimeout: true };
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body });
    const res = mockResponse();
    await controller.post(req, res);
    expect(res.end).toHaveBeenCalledWith();
  });

  test('whether the citizen update api call is made with correct user details firstname lastname update caseid', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = { applicant1FirstName: 'Testm', applicant1LastName: 'Testn', applicant1Email: 'abc@gmail.com' };
    const controller = new PostController(mockFormContent.fields);

    const expectedUserCase = {
      id: '1234',
      applicant1FirstName: 'Testm',
      applicant1LastName: 'Testn',
      applicant1Email: 'abc@gmail.com',
    };

    const req = mockRequest({ body });
    (req.locals.api.triggerEvent as jest.Mock).mockResolvedValueOnce(expectedUserCase);
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual(expectedUserCase);
    expect(getNextStepUrlMock).toHaveBeenCalledWith(req, expectedUserCase);
    expect(res.redirect).toHaveBeenCalledWith('/next-step-url');
    expect(req.session.errors).toStrictEqual([]);
  });

  test('whether NO calls are made to server when valid input data is given', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = {
      id: '',
      state: 'Holding',
    };
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body, session: { user: { email: 'test@example.com' }, userCase: {} } });
    const res = mockResponse();
    req.originalUrl = '/citizen-home';

    await controller.post(req, res);
    expect(req.session.userCase.id).toEqual('');
    expect(req.session.userCase.state).toEqual('Holding');
  });

  // eslint-disable-next-line jest/expect-expect
  test('whether the CREATE CASE method is called when valid input data is given', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = {
      id: '',
      state: 'Holding',
      saveAndContinue: 'true',
      serviceType: 'No',
      applicantFirstName: 'qazqazqwe',
      applicantLastName: 'wsxwsxdfg',
    };
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body, session: { user: { email: 'test@example.com' }, userCase: {} } });
    const res = mockResponse();
    req.originalUrl = '/full-name';

    await controller.post(req, res);
    expect(req.session.userCase.id).toEqual('');
    expect(req.session.userCase.state).toEqual('Holding');
  });

  test('should post form with a custom field function', async () => {
    const fieldsFn = jest.fn().mockReturnValue({
      fields: {},
    });
    const controller = new PostController(fieldsFn);

    const body = {
      id: '',
      state: 'Holding',
      saveAndContinue: 'true',
      serviceType: 'No',
      applicantFirstName: 'qazqazqwe',
      applicantLastName: 'wsxwsxdfg',
    };

    const req = mockRequest({ body });
    const res = mockResponse();
    await controller.post(req, res);

    expect(fieldsFn).toHaveBeenCalledWith(req.session.userCase);
  });

  describe('getEventName', () => {
    const subjectContactDetailsUrl = '/subject-contact-details';
    const contactDetailsUrl = '/contact-details';
    const checkYourAnswersUrl = '/check-your-answers';

    test('should return CITIZEN_CREATE when originalUrl starts with SUBJECT_CONTACT_DETAILS and isBlank returns true', () => {
      const userCase = { id: '' };
      const req = { originalUrl: subjectContactDetailsUrl, session: { userCase } } as AppRequest;
      const controller = new PostController(mockFormContent.fields);
      const eventName = controller.getEventName(req);

      expect(eventName).toEqual(CITIZEN_CIC_CREATE_CASE);
    });

    test('should return CITIZEN_UPDATE when originalUrl is CONTACT_DETAILS', () => {
      const req = { originalUrl: contactDetailsUrl } as AppRequest;
      const controller = new PostController(mockFormContent.fields);

      const eventName = controller.getEventName(req);

      expect(eventName).toEqual(CITIZEN_CIC_UPDATE_CASE);
    });

    test('should return CITIZEN_UPDATE when originalUrl is CICA_REFERENCE_NUMBER', () => {
      const req = { originalUrl: CICA_REFERENCE_NUMBER } as AppRequest;
      const controller = new PostController(mockFormContent.fields);

      const eventName = controller.getEventName(req);

      expect(eventName).toEqual(CITIZEN_CIC_UPDATE_CASE);
    });

    test('should return CITIZEN_SUBMIT when originalUrl is CHECK_YOUR_ANSWERS', () => {
      const req = { originalUrl: checkYourAnswersUrl } as AppRequest;
      const controller = new PostController(mockFormContent.fields);

      const eventName = controller.getEventName(req);

      expect(eventName).toEqual(CITIZEN_CIC_SUBMIT_CASE);
    });

    test('should return undefined when originalUrl does not match any known patterns', () => {
      const req = { originalUrl: '/another-url' } as AppRequest;
      const controller = new PostController(mockFormContent.fields);

      const eventName = controller.getEventName(req);

      expect(eventName).toBeUndefined();
    });
  });
});
