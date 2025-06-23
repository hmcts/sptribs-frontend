import axios, { AxiosInstance, AxiosResponse } from 'axios';
import config from 'config';
import FormData from 'form-data';

import { getServiceAuthToken } from '../auth/service/get-service-auth-token';
import type { UserDetails } from '../controller/AppRequest';
import type { Document } from 'app/case/definition';

export class CaseDocumentManagementClient {
  client: AxiosInstance;
  BASE_URL: string = config.get('services.cdam.url');

  constructor(user: UserDetails) {
    this.client = axios.create({
      baseURL: this.BASE_URL,
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        ServiceAuthorization: getServiceAuthToken(),
        'user-id': user.id,
      },
    });
  }

  async create({
    files,
    classification,
  }: {
    files: UploadedFiles;
    classification: Classification;
  }): Promise<DocumentManagementFile[]> {
    const formData = new FormData();
    formData.append('caseTypeId', config.get('caseType'));
    formData.append('jurisdictionId', config.get('jurisdiction'));
    formData.append('classification', classification);

    for (const [, file] of Object.entries(files)) {
      formData.append('files', file.data, file.name);
    }

    const response: AxiosResponse<CaseDocumentManagementResponse> = await this.client.post(
      '/cases/documents',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: config.get<number>('uploadTimeout'),
      }
    );
    return response.data?.documents || [];
  }

  async delete(document: Document): Promise<AxiosResponse> {
    const id = document._links.self.href.split('/').pop();
    
    if (!id) {
      throw new Error('Document ID not found in the URL');
    }

    return this.client.delete(`/cases/documents/${id}`);
  }
}

interface CaseDocumentManagementResponse {
  documents: DocumentManagementFile[];
}

export interface DocumentManagementFile {
  description?: string;
  size: number;
  mimeType: string;
  originalDocumentName: string;
  modifiedOn: string;
  createdOn: string;
  classification: Classification;
  _links: {
    self: {
      href: string;
    };
    binary: {
      href: string;
    };
    thumbnail: {
      href: string;
    };
  };
}

export type UploadedFiles =
  | {
      [fieldname: string]: Express.Multer.File[];
    }
  | Express.Multer.File[];

export enum Classification {
  Private = 'PRIVATE',
  Restricted = 'RESTRICTED',
  Public = 'PUBLIC',
}
