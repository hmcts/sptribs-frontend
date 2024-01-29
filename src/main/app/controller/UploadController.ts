import { Logger } from '@hmcts/nodejs-logging';
import autobind from 'autobind-decorator';
import axios, { AxiosInstance, RawAxiosRequestHeaders } from 'axios';
import config from 'config';
import { Response } from 'express';
import FormData from 'form-data';
import { isNull } from 'lodash';

import { getServiceAuthToken } from '../../app/auth/service/get-service-auth-token';
import { mapCaseData } from '../../app/case/CaseApi';
import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../app/controller/PostController';
import { Form, FormFields, FormFieldsFn } from '../../app/form/Form';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';
import { SPTRIBS_CASE_API_BASE_URL } from '../../steps/common/constants/apiConstants';
import { UPLOAD_APPEAL_FORM, UPLOAD_SUPPORTING_DOCUMENTS } from '../../steps/urls';
const logger = Logger.getLogger('uploadDocumentPostController');

/**
 * ****** File Extensions Types are being checked
 */
type FileType = {
  doc: string;
  docx: string;
  pdf: string;
  png: string;
  xls: string;
  xlsx: string;
  jpg: string;
  txt: string;
  rtf: string;
  rtf2: string;
  mp4audio: string;
  mp4video: string;
  mp3: string;
};

/**
 * ****** File MimeTypes are being check
 */
type FileMimeTypeInfo = {
  'application/msword': string;
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': string;
  'application/pdf': string;
  'image/png': string;
  'application/vnd.ms-excel': string;
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': string;
  'image/jpeg': string;
  'text/plain': string;
  'application/rtf': string;
  'text/rtf': string;
  'audio/mp4': string;
  'video/mp4': string;
  'audio/mpeg': string;
};

type FileUploadErrorTranslatables = {
  FORMAT_ERROR?: string;
  SIZE_ERROR?: string;
  TOTAL_FILES_EXCEED_ERROR?: string;
  CONTINUE_WITHOUT_UPLOAD_ERROR?: string;
  NO_FILE_UPLOAD_ERROR?: string;
  UPLOAD_DELETE_FAIL_ERROR?: string;
};

export const CASE_API_URL: string = config.get(SPTRIBS_CASE_API_BASE_URL);

/**
 * @FileHandler
 */
export const FileMimeType: Partial<Record<keyof FileType, keyof FileMimeTypeInfo>> = {
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

export class FileValidations {
  static ResourceReaderContents(req: AppRequest<AnyObject>, page: string): FileUploadErrorTranslatables {
    let systemContent: FileUploadErrorTranslatables = {};
    const systemLanguage = req.session['lang'];
    const resourceLoader = new ResourceReader();
    resourceLoader.Loader(page);
    const errorInLanguages = resourceLoader.getFileContents().errors;
    switch (systemLanguage) {
      case 'en':
        systemContent = errorInLanguages.en;
        break;
      case 'cy':
        systemContent = errorInLanguages.cy;
        break;
      default:
        systemContent = errorInLanguages.en;
    }
    return systemContent;
  }

  /**
   *
   * @param fileSize
   * @returns
   */
  static sizeValidation(mimeType: string, fileSize: number): boolean {
    const bytes =
      mimeType.startsWith('audio/') || mimeType.startsWith('video/')
        ? Number(config.get('documentUpload.validation.multimediaSizeInBytes'))
        : Number(config.get('documentUpload.validation.sizeInBytes')); //careful mb and b difference
    if (fileSize <= bytes) {
      return true;
    } else {
      return false;
    }
  }

  /**
   *
   * @param mimeType
   * @returns
   */
  static formatValidation(mimeType: string): boolean {
    const allMimeTypes = Object.values(FileMimeType);
    const checkForFileMimeType = allMimeTypes.filter(aMimeType => aMimeType === mimeType);
    return checkForFileMimeType.length > 0;
  }
}

@autobind
export class UploadController extends PostController<AnyObject> {
  constructor(protected readonly fields: FormFields | FormFieldsFn) {
    super(fields);
  }

  async postDocumentUploader(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const chooseFileLink = '#file-upload-1';
    let totalUploadDocuments;
    if (req.session.hasOwnProperty(this.getPropertyName())) {
      totalUploadDocuments = req.session[this.getPropertyName()].length;
      if (totalUploadDocuments === 0 && this.checkIfNoFilesUploaded()) {
        this.createUploadedFileError(req, res, chooseFileLink, 'CONTINUE_WITHOUT_UPLOAD_ERROR');
      } else {
        const caseId = req.session.userCase['id'];
        const baseUrl = '/case/dss-orchestration/' + caseId + '/update?event=UPDATE';
        const headers = {
          authorization: `Bearer ${req.session.user['accessToken']}`,
          serviceAuthorization: getServiceAuthToken(),
        };
        try {
          let tribunalFormDocuments: Document[] = [];
          if (req.session.caseDocuments !== undefined) {
            tribunalFormDocuments = this.getTribunalFormDocuments(req);
          }
          let supportingDocuments: Document[] = [];
          if (req.session.supportingCaseDocuments !== undefined) {
            supportingDocuments = this.getSupportingDocuments(req);
          }
          let otherInfoDocuments: Document[] = [];
          if (req.session.otherCaseInformation !== undefined) {
            otherInfoDocuments = this.getOtherInfoDocuments(req);
          }
          const caseData = mapCaseData(req);
          const responseBody = {
            ...caseData,
            tribunalFormDocuments,
            supportingDocuments,
            otherInfoDocuments,
          };
          await this.uploadDocumentInstance(CASE_API_URL, headers).put(baseUrl, responseBody);
          res.redirect(this.getNextPageRedirectUrl());
        } catch (error) {
          this.createUploadedFileError(req, res, chooseFileLink, 'UPLOAD_DELETE_FAIL_ERROR');
        }
      }
    }
  }

  public uploadDocumentInstance(baseUrl: string, header: RawAxiosRequestHeaders): AxiosInstance {
    return axios.create({
      baseURL: baseUrl,
      headers: header,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
  }

  private getOtherInfoDocuments(req: AppRequest<AnyObject>): Document[] {
    return req.session['otherCaseInformation'].map(document => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { url, fileName, documentId, binaryUrl } = document;
      return {
        id: documentId,
        value: {
          documentLink: {
            document_url: url,
            document_filename: fileName,
            document_binary_url: binaryUrl,
          },
        },
      };
    });
  }

  private getSupportingDocuments(req: AppRequest<AnyObject>): Document[] {
    return req.session['supportingCaseDocuments'].map(document => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { url, fileName, documentId, binaryUrl } = document;
      return {
        id: documentId,
        value: {
          documentLink: {
            document_url: url,
            document_filename: fileName,
            document_binary_url: binaryUrl,
          },
        },
      };
    });
  }

  private getTribunalFormDocuments(req: AppRequest<AnyObject>): Document[] {
    return req.session['caseDocuments'].map(document => {
      const { url, fileName, documentId, binaryUrl } = document;
      return {
        id: documentId,
        value: {
          documentLink: {
            document_url: url,
            document_filename: fileName,
            document_binary_url: binaryUrl,
          },
        },
      };
    });
  }

  private uploadFileError(
    req: AppRequest<AnyObject>,
    res: Response<any, Record<string, any>>,
    redirectUrlIfError: string,
    errorMessage?: string,
    link?: string
  ): void {
    req.session.fileErrors.push({
      text: errorMessage,
      href: link,
    });

    this.redirect(req, res, redirectUrlIfError);
  }

  /**
   *
   * @param req
   * @param res
   */
  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    await this.submit(req, res);
  }

  /**
   *
   * @param req
   * @param res
   */
  public async submit(req: AppRequest<AnyObject>, res: Response<any, Record<string, any>>): Promise<void> {
    const chooseFileLink = '#file-upload-1';
    const filesUploadedLink = '#filesUploaded';
    const { documentUploadProceed } = req.body;

    if (this.shouldSetUpFormData()) {
      this.setUpForm(req);
    }

    let totalUploadDocuments = 0;
    totalUploadDocuments = this.getTotalUploadDocumentsFromSessionProperty(req, totalUploadDocuments);

    if (documentUploadProceed) {
      /**
       * @PostDocumentUploader
       */
      this.postDocumentUploader(req, res);
    } else {
      const { files }: AppRequest<AnyObject> = req;

      if (isNull(files)) {
        this.createUploadedFileError(req, res, chooseFileLink, 'NO_FILE_UPLOAD_ERROR');
      } else if (totalUploadDocuments < Number(config.get(this.getValidationTotal()))) {
        if (!req.session.hasOwnProperty('errors')) {
          req.session['errors'] = [];
        }

        const { documents }: any = files;

        const checkIfMultipleFiles: boolean = Array.isArray(documents);

        // making sure single file is uploaded
        if (!checkIfMultipleFiles) {
          const validateMimeType: boolean = FileValidations.formatValidation(documents.mimetype);
          const validateFileSize: boolean = FileValidations.sizeValidation(documents.mimetype, documents.size);
          const formData: FormData = new FormData();
          if (validateMimeType && validateFileSize) {
            formData.append('file', documents.data, {
              contentType: documents.mimetype,
              filename: documents.name,
            });
            const formHeaders = formData.getHeaders();
            /**
             * @RequestHeaders
             */
            const headers = {
              authorization: `Bearer ${req.session.user['accessToken']}`,
              serviceAuthorization: getServiceAuthToken(),
            };
            try {
              await this.addUploadedFileToData(headers, formData, formHeaders, req);
              this.redirect(req, res, this.getCurrentPageRedirectUrl());
            } catch (error) {
              logger.error(error);
              this.createUploadedFileError(req, res, chooseFileLink, 'UPDATE_DELETE_FAIL_ERROR');
            }
          } else {
            if (!validateFileSize) {
              this.createUploadedFileError(req, res, chooseFileLink, 'SIZE_ERROR');
            }

            if (!validateMimeType) {
              this.createUploadedFileError(req, res, chooseFileLink, 'FORMAT_ERROR');
            }

            this.redirect(req, res, this.getCurrentPageRedirectUrl());
          }
        }
      } else {
        this.createUploadedFileError(req, res, filesUploadedLink, 'TOTAL_FILES_EXCEED_ERROR');

        this.redirect(req, res, this.getCurrentPageRedirectUrl());
      }
    }
  }

  //methods overridden in subclasses
  protected getPropertyName(): string {
    return 'caseDocuments';
  }

  protected getNextPageRedirectUrl(): `/${string}` {
    return UPLOAD_SUPPORTING_DOCUMENTS;
  }

  protected getCurrentPageRedirectUrl(): `/${string}` {
    return UPLOAD_APPEAL_FORM;
  }

  protected getValidationTotal(): string {
    return 'documentUpload.validation.totaldocuments';
  }

  protected checkIfNoFilesUploaded(): boolean {
    return true;
  }

  protected shouldSetUpFormData(): boolean {
    return false;
  }

  private async addUploadedFileToData(
    headers: { authorization: string; serviceAuthorization: string },
    formData: FormData,
    formHeaders: FormData.Headers,
    req: AppRequest<AnyObject>
  ): Promise<void> {
    const requestDocument = await this.getRequestDocument(headers, formData, formHeaders);
    const uploadedDocument = requestDocument.data.document;
    req.session[this.getPropertyName()].push(uploadedDocument);
    req.session['errors'] = undefined;
  }

  private createUploadedFileError(
    req: AppRequest<AnyObject>,
    res: Response<any, Record<string, any>>,
    fileLink: string,
    errorType: string
  ): void {
    let errorMessage;
    const fileValidation = FileValidations.ResourceReaderContents(req, this.getCurrentPageRedirectUrl());
    if (errorType === 'NO_FILE_UPLOAD_ERROR') {
      errorMessage = fileValidation.NO_FILE_UPLOAD_ERROR;
    } else if (errorType === 'SIZE_ERROR') {
      errorMessage = fileValidation.SIZE_ERROR;
    } else if (errorType === 'FORMAT_ERROR') {
      errorMessage = fileValidation.FORMAT_ERROR;
    } else if (errorType === 'TOTAL_FILES_EXCEED_ERROR') {
      errorMessage = fileValidation.TOTAL_FILES_EXCEED_ERROR;
    } else if (errorType === 'CONTINUE_WITHOUT_UPLOAD_ERROR') {
      errorMessage = fileValidation.CONTINUE_WITHOUT_UPLOAD_ERROR;
    } else {
      errorMessage = fileValidation.UPLOAD_DELETE_FAIL_ERROR;
    }
    this.uploadFileError(req, res, this.getCurrentPageRedirectUrl(), errorMessage, fileLink);
  }

  private setUpForm(req: AppRequest<AnyObject>): void {
    const fields = typeof this.fields === 'function' ? this.fields(req.session.userCase) : this.fields;
    const form = new Form(fields);
    const { saveAndSignOut, saveBeforeSessionTimeout, _csrf, ...formData } = form.getParsedBody(req.body);
    req.session.errors = form.getErrors(formData);
    Object.assign(req.session.userCase, formData);
  }

  private async getRequestDocument(
    headers: { authorization: string; serviceAuthorization: string },
    formData: FormData,
    formHeaders: FormData.Headers
  ): Promise<any> {
    return this.uploadDocumentInstance(CASE_API_URL, headers).post(
      '/doc/dss-orchestration/upload?caseTypeOfApplication=CIC',
      formData,
      {
        headers: {
          ...formHeaders,
          serviceAuthorization: getServiceAuthToken(),
        },
      }
    );
  }

  private getTotalUploadDocumentsFromSessionProperty(req: AppRequest<AnyObject>, totalUploadDocuments: number): number {
    if (!req.session.hasOwnProperty(this.getPropertyName())) {
      req.session[this.getPropertyName()] = [];
    } else {
      totalUploadDocuments = req.session[this.getPropertyName()].length;
      req.session['errors'] = [];
    }
    return totalUploadDocuments;
  }
}
