import axios from 'axios';
import config from 'config';

import { mockRequest } from '../../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../../test/unit/utils/mockResponse';
import { CHECK_YOUR_ANSWERS } from '../../urls';

import PCQGetController from './get';

jest.mock('axios');
jest.mock('config');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedConfig = config as jest.Mocked<typeof config>;
mockedAxios.create = jest.fn(() => mockedAxios);

describe('PCQGetController', () => {
  const controller = new PCQGetController();

  test('Should redirect to PCQ', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('true');
    mockedConfig.get.mockReturnValueOnce('https://sptribs');
    mockedConfig.get.mockReturnValueOnce('SERVICE_TOKEN_KEY');
    mockedConfig.get.mockReturnValueOnce('/service-endpoint');

    const req = mockRequest();
    const res = mockResponse();
    req.session.userCase.subjectDateOfBirth = { day: '01', month: '01', year: '1970' };
    req.session.caseDocuments = [
      {
        url: 'url',
        filename: 'fileName',
        documentId: 'documentId',
        binaryUrl: 'binaryUrl',
      },
    ];
    req.session.supportingCaseDocuments = [
      {
        url: 'url',
        filename: 'fileName',
        documentId: 'documentId',
        binaryUrl: 'binaryUrl',
      },
    ];
    req.session.otherCaseInformation = [
      {
        url: 'url',
        filename: 'fileName',
        documentId: 'documentId',
        binaryUrl: 'binaryUrl',
      },
    ];
    const redirectMock = jest.fn();
    res.redirect = redirectMock;

    mockedAxios.get.mockResolvedValue({
      data: {
        status: 'UP',
      },
    });

    mockedAxios.put.mockResolvedValue({
      status: 200,
    });

    await controller.get(req, res);
    expect(redirectMock.mock.calls[0][0]).toContain('/service-endpoint');
    expect(redirectMock.mock.calls[0][0]).toContain('ageCheck=2');
  });

  test('Should set ageCheck value to 1', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('true');
    mockedConfig.get.mockReturnValueOnce('https://sptribs');
    mockedConfig.get.mockReturnValueOnce('SERVICE_TOKEN_KEY');
    mockedConfig.get.mockReturnValueOnce('/service-endpoint');

    const req = mockRequest();
    const res = mockResponse();
    const today = new Date();
    req.session.userCase.subjectDateOfBirth = {
      day: today.getDate().toString(),
      month: (today.getMonth() + 1).toString(),
      year: (today.getFullYear() - 16).toString(),
    };
    req.session.caseDocuments = [];

    const redirectMock = jest.fn();
    res.redirect = redirectMock;

    mockedAxios.get.mockResolvedValue({
      data: {
        status: 'UP',
      },
    });
    mockedAxios.put.mockResolvedValue({
      status: 200,
    });

    await controller.get(req, res);
    expect(redirectMock.mock.calls[0][0]).toContain('/service-endpoint');
    expect(redirectMock.mock.calls[0][0]).toContain('ageCheck=1');
  });

  test('Should not invoke PCQ if under 16', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('true');

    const req = mockRequest();
    const res = mockResponse();
    const today = new Date();
    req.session.userCase.subjectDateOfBirth = {
      day: today.getDay().toString(),
      month: (today.getMonth() + 1).toString(),
      year: (today.getFullYear() - 1).toString(),
    };
    req.session.caseDocuments = [];

    const redirectMock = jest.fn();
    res.redirect = redirectMock;

    mockedAxios.get.mockResolvedValue({
      data: {
        status: 'UP',
      },
    });
    mockedAxios.put.mockResolvedValue({
      status: 200,
    });

    await controller.get(req, res);
    expect(redirectMock.mock.calls[0][0]).toContain('/check-your-answers');
  });

  test('Should redirect to Check Your Answers if PCQ Health is DOWN', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('true');
    const req = mockRequest();
    const res = mockResponse();
    req.session.userCase.subjectDateOfBirth = { day: '01', month: '01', year: '1970' };
    req.session.caseDocuments = [];

    mockedAxios.get.mockResolvedValue(
      Promise.resolve({
        data: {
          status: 'DOWN',
        },
      })
    );

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CHECK_YOUR_ANSWERS);
  });

  test('Should redirect to Check Your Answers if pcqId is already populated', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('true');
    const req = mockRequest();
    const res = mockResponse();
    req.session.userCase.subjectDateOfBirth = { day: '01', month: '01', year: '1970' };
    req.session.caseDocuments = [];
    req.session.userCase.pcqId = '1234';

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CHECK_YOUR_ANSWERS);
  });

  test('Should redirect to Check Your Answers if PCQ is disabled', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('false');

    const req = mockRequest();
    const res = mockResponse();
    req.session.userCase.subjectDateOfBirth = { day: '01', month: '01', year: '1970' };
    req.session.caseDocuments = [];

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CHECK_YOUR_ANSWERS);
  });

  test('Should not invoke PCQ if cannot update case', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('true');
    mockedConfig.get.mockReturnValueOnce('https://sptribs');

    const req = mockRequest();
    const res = mockResponse();
    req.session.userCase.subjectDateOfBirth = { day: '01', month: '01', year: '1970' };
    req.session.caseDocuments = [];

    const redirectMock = jest.fn();
    res.redirect = redirectMock;

    mockedAxios.get.mockResolvedValue({
      data: {
        status: 'UP',
      },
    });
    mockedAxios.put.mockResolvedValue({
      status: 500,
    });

    await controller.get(req, res);
    expect(redirectMock.mock.calls[0][0]).toContain('/check-your-answers');
  });
});
