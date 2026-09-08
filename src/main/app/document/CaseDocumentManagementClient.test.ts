import axios, { AxiosInstance } from 'axios';
import config from 'config';

import * as serviceAuth from '../auth/service/get-service-auth-token';
import { UserDetails } from '../controller/AppRequest';

import { CaseDocumentManagementClient, Classification, UploadedFiles } from './CaseDocumentManagementClient';

jest.mock('axios');
jest.mock('config');
jest.mock('../auth/service/get-service-auth-token');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedConfig = config as jest.Mocked<typeof config>;
const mockServiceAuth = serviceAuth as jest.Mocked<typeof serviceAuth>;

describe('CaseDocumentManagementClient', () => {
  it('creates documents', async () => {
    const mockPost = jest.fn().mockResolvedValue({ data: { documents: ['a-document'] } });
    mockedAxios.create.mockReturnValueOnce({ post: mockPost } as unknown as AxiosInstance);
    mockedConfig.get.mockReturnValueOnce('case-document-management-base-url');
    mockedConfig.get.mockReturnValueOnce('caseType');
    mockedConfig.get.mockReturnValueOnce('jurisdiction');
    mockServiceAuth.getServiceAuthToken.mockReturnValueOnce('dummyS2SAuthToken');

    const client = new CaseDocumentManagementClient({
      id: 'userId',
      accessToken: 'userAccessToken',
    } as unknown as UserDetails);

    const actual = await client.create({
      files: { documents: { data: '123', name: 'a-new-file' } } as unknown as UploadedFiles,
      classification: Classification.Private,
    });

    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'case-document-management-base-url',
      headers: {
        Authorization: 'Bearer userAccessToken',
        ServiceAuthorization: 'dummyS2SAuthToken',
        'user-id': 'userId',
      },
    });

    expect(mockPost.mock.calls[0][0]).toEqual('/cases/documents');
    expect(mockPost.mock.calls[0][1]._streams[9]).toContain('filename="a-new-file"');
    expect(mockPost.mock.calls[0][1]._streams[7]).toEqual('PRIVATE');
    expect(actual).toEqual(['a-document']);
  });

  it('deletes documents', async () => {
    const mockDelete = jest.fn().mockResolvedValue({ data: 'MOCKED-OK' });
    mockedAxios.create.mockReturnValueOnce({ delete: mockDelete } as unknown as AxiosInstance);

    const client = new CaseDocumentManagementClient({
      id: 'userId',
      accessToken: 'userAccessToken',
    } as unknown as UserDetails);

    const actual = await client.delete({
      _links: { self: { href: 'http://localhost/doc' } },
    } as any);

    expect(mockDelete.mock.calls[0][0]).toEqual('/cases/documents/doc');
    expect(actual).toEqual({ data: 'MOCKED-OK' });
  });
});
