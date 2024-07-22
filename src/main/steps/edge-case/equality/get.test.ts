import axios, { RawAxiosRequestHeaders } from 'axios';
import config from 'config';

import { mockRequest } from '../../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../../test/unit/utils/mockResponse';
import { mockUserCase4, mockUserCase4Output } from '../../../../test/unit/utils/mockUserCase';
import { getServiceAuthToken } from '../../../app/auth/service/get-service-auth-token';
import { SPTRIBS_CASE_API_BASE_URL } from '../../common/constants/apiConstants';
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

  test('Should pass additional document information to axios', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('true');
    mockedConfig.get.mockReturnValueOnce('https://sptribs');
    mockedConfig.get.mockReturnValueOnce('SERVICE_TOKEN_KEY');
    mockedConfig.get.mockReturnValueOnce('/service-endpoint');

    const req = mockRequest({ userCase: mockUserCase4 });
    const res = mockResponse();

    const headers: RawAxiosRequestHeaders = {
      authorization: `Bearer ${req.session.user['accessToken']}`,
      serviceAuthorization: getServiceAuthToken(),
    };
    const baseUrl = '/case/dss-orchestration/' + req.session.userCase.id + '/update?event=UPDATE';

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

    mockUserCase4Output.PcqId = req.session.userCase.pcqId;

    const requestBody = {
      ...mockUserCase4Output,
      TribunalFormDocuments,
      SupportingDocuments,
      OtherInfoDocuments,
    };

    expect(
      axios.create({
        baseURL: config.get(SPTRIBS_CASE_API_BASE_URL),
        headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }).put
    ).toHaveBeenCalledWith(baseUrl, requestBody);

  test('Should redirect to Check your answers page if PCQ is DOWN', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('true');
    mockedConfig.get.mockReturnValueOnce('https://sptribs');

    const req = mockRequest();
    const res = mockResponse();
    req.session.userCase.subjectDateOfBirth = { day: '01', month: '01', year: '1970' };
    req.session.caseDocuments = [];

    const redirectMock = jest.fn();
    res.redirect = redirectMock;

    mockedAxios.get.mockRejectedValueOnce({
      data: {
        status: 'DOWN',
      },
    });
    mockedAxios.put.mockResolvedValue({
      status: 500,
    });

    await controller.get(req, res);
    expect(redirectMock.mock.calls[0][0]).toContain('/check-your-answers');
  });
});
