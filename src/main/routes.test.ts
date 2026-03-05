import { Application } from 'express';

import { mockRequest } from '../test/unit/utils/mockRequest';
import { mockResponse } from '../test/unit/utils/mockResponse';

import { Routes, restrictContentType } from './routes';
import {
  ACCESSIBILITY_STATEMENT,
  APPLICATION_SUBMITTED,
  CHECK_YOUR_ANSWERS,
  CICA_DECISION_DATE,
  CICA_REFERENCE_NUMBER,
  CONTACT_US,
  CSRF_TOKEN_ERROR_URL,
  EQUALITY,
  HOME_URL,
  PRIVACY_POLICY,
  REPRESENTATION,
  REPRESENTATION_QUALIFIED,
  REPRESENTATIVES_DETAILS,
  SAVE_AND_SIGN_OUT,
  SUBJECT_CONTACT_DETAILS,
  TERMS_AND_CONDITIONS,
  TIMED_OUT_URL,
  UPLOAD_APPEAL_FORM,
  UPLOAD_OTHER_INFORMATION,
  UPLOAD_SUPPORTING_DOCUMENTS,
} from './steps/urls';

describe('Routes', () => {
  it('sets up dynamic step sequence routes', () => {
    const appMock = {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
      use: jest.fn(),
      locals: {
        errorHandler: jest.fn(),
      },
    } as unknown as Application;

    new Routes().enableFor(appMock);

    expect(appMock.locals.errorHandler).toHaveBeenCalled();

    expect(appMock.get).toHaveBeenCalledWith(PRIVACY_POLICY, undefined);
    expect(appMock.get).toHaveBeenCalledWith(TERMS_AND_CONDITIONS, undefined);
    expect(appMock.get).toHaveBeenCalledWith(ACCESSIBILITY_STATEMENT, undefined);
    expect(appMock.get).toHaveBeenCalledWith(TIMED_OUT_URL, undefined);
    expect(appMock.get).toHaveBeenCalledWith(CONTACT_US, undefined);

    expect(appMock.get).toHaveBeenCalledWith(CSRF_TOKEN_ERROR_URL, undefined);
    expect(appMock.get).toHaveBeenCalledWith(HOME_URL, undefined);
    expect(appMock.get).toHaveBeenCalledWith(SAVE_AND_SIGN_OUT, undefined);
    expect(appMock.get).toHaveBeenCalledWith(SUBJECT_CONTACT_DETAILS, undefined);
    expect(appMock.get).toHaveBeenCalledWith(REPRESENTATION, undefined);
    expect(appMock.get).toHaveBeenCalledWith(REPRESENTATION_QUALIFIED, undefined);
    expect(appMock.get).toHaveBeenCalledWith(REPRESENTATIVES_DETAILS, undefined);
    expect(appMock.get).toHaveBeenCalledWith(CICA_REFERENCE_NUMBER, undefined);
    expect(appMock.get).toHaveBeenCalledWith(CICA_DECISION_DATE, undefined);
    expect(appMock.get).toHaveBeenCalledWith(UPLOAD_APPEAL_FORM, undefined);
    expect(appMock.get).toHaveBeenCalledWith(UPLOAD_SUPPORTING_DOCUMENTS, undefined);
    expect(appMock.get).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION, undefined);
    expect(appMock.get).toHaveBeenCalledWith(EQUALITY, undefined);
    expect(appMock.get).toHaveBeenCalledWith(CHECK_YOUR_ANSWERS, undefined);
    expect(appMock.get).toHaveBeenCalledWith(APPLICATION_SUBMITTED, undefined);

    expect(appMock.post).toHaveBeenCalledWith(SUBJECT_CONTACT_DETAILS, undefined);
    expect(appMock.post).toHaveBeenCalledWith(REPRESENTATION, undefined);
    expect(appMock.post).toHaveBeenCalledWith(REPRESENTATION_QUALIFIED, undefined);
    expect(appMock.post).toHaveBeenCalledWith(REPRESENTATIVES_DETAILS, undefined);
    expect(appMock.post).toHaveBeenCalledWith(CICA_REFERENCE_NUMBER, undefined);
    expect(appMock.post).toHaveBeenCalledWith(CICA_DECISION_DATE, undefined);
    expect(appMock.post).toHaveBeenCalledWith(UPLOAD_APPEAL_FORM, undefined);
    expect(appMock.post).toHaveBeenCalledWith(UPLOAD_SUPPORTING_DOCUMENTS, undefined);
    expect(appMock.post).toHaveBeenCalledWith(UPLOAD_OTHER_INFORMATION, undefined);
    expect(appMock.post).toHaveBeenCalledWith(EQUALITY, undefined);
    expect(appMock.post).toHaveBeenCalledWith(CHECK_YOUR_ANSWERS, undefined);

    expect(appMock.use).toHaveBeenCalled();
  });
});

describe('restrictContentType', () => {
  it('should return a function that checks content type and sends 403 if it matches', () => {
    const req = mockRequest({
      headers: {
        'content-type': 'application/json',
      },
    });

    const res = mockResponse();
    res.status = jest.fn().mockReturnThis();
    res.send = jest.fn();

    const next = jest.fn();

    const middleware = restrictContentType(['application/json']);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if content type does not match', () => {
    const req = mockRequest({
      headers: {
        'content-type': 'text/html',
      },
    });

    const res = mockResponse();
    res.status = jest.fn().mockReturnThis();
    res.send = jest.fn();

    const next = jest.fn();
    const middleware = restrictContentType(['application/json']);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });
});
