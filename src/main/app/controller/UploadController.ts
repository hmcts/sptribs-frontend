import { Logger } from '@hmcts/nodejs-logging';
import autobind from 'autobind-decorator';
import axios, { AxiosInstance, RawAxiosRequestHeaders } from 'axios';
import config from 'config';
import { Response } from 'express';
import FormData from 'form-data';
import { isNull } from 'lodash';

import { getServiceAuthToken } from '../../app/auth/service/get-service-auth-token';
import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../app/controller/PostController';
import { Form, FormFields, FormFieldsFn } from '../../app/form/Form';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';
import { SPTRIBS_CASE_API_BASE_URL } from '../../steps/common/constants/apiConstants';
import { UPLOAD_APPEAL_FORM, UPLOAD_SUPPORTING_DOCUMENTS } from '../../steps/urls';
import { CITIZEN_CIC_UPDATE_CASE } from '../case/definition';
import { containsInvalidCharacters, isMarkDownLinkIncluded } from '../form/validation';
const logger = Logger.getLogger('uploadDocumentPostController');

/**
 * ****** File Extensions Types are being checked
 */
export type FileType = {
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
export type FileMimeTypeInfo = {
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

export class FileValidations {
  static ResourceReaderContents(req: AppRequest<AnyObject>, page: string): FileUploadErrorTranslatables {
    let systemContent: FileUploadErrorTranslatables = {};
    const systemLanguage = req.session['lang'];
    const resourceLoader = new ResourceReader();
    resourceLoader.Loader(page);
    const errorInLanguages = resourceLoader.getFileContents().errors;
    switch (systemLanguage) {
      case 'cy':
        systemContent = errorInLanguages.cy;
        break;
      case 'en':
      default:
        systemContent = errorInLanguages.en;
    }
    return systemContent;
  }

  static sizeValidation(fileSize: number): boolean {
    const bytes: number = Number(config.get('documentUpload.validation.sizeInBytes'));
    return fileSize <= bytes;
  }

  static formatValidation(
    mimeType: string,
    acceptedFileMimeType: Partial<Record<keyof FileType, keyof FileMimeTypeInfo>>
  ): boolean {
    const allMimeTypes = Object.values(acceptedFileMimeType);
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
    const chooseFileLink: string = '#file-upload-1';

    const totalUploadDocuments: number = req.session.hasOwnProperty(this.getPropertyName())
      ? req.session[this.getPropertyName()].length
      : 0;

    if (totalUploadDocuments === 0 && this.checkIfNoFilesUploaded()) {
      this.createUploadedFileError(req, res, chooseFileLink, 'CONTINUE_WITHOUT_UPLOAD_ERROR');
    } else {
      try {
        req.session.userCase.additionalInformation = req.body.additionalInformation as string;

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

        const responseBody = {
          tribunalFormDocuments,
          supportingDocuments,
          otherInfoDocuments,
        };

        const caseId = req.session.userCase['id'];
        req.session.userCase = await req.locals.api.triggerEvent(caseId, responseBody, CITIZEN_CIC_UPDATE_CASE);

        req.session.save(err => {
          if (err) {
            throw err;
          }
          res.redirect(this.getNextPageRedirectUrl());
        });
      } catch (error) {
        logger.error(error);
        this.createUploadedFileError(req, res, chooseFileLink, 'UPLOAD_DELETE_FAIL_ERROR');
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
          comment: document.description ? document.description : null,
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

  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    await this.submit(req, res);
  }

  public async submit(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const chooseFileLink = '#file-upload-1';
    const filesUploadedLink = '#filesUploaded';
    const saveAndContinue = JSON.parse(JSON.stringify(req.body)).hasOwnProperty('saveAndContinue');

    if (this.shouldSetUpFormData()) {
      this.setUpForm(req);
    }

    let totalUploadDocuments = 0;
    totalUploadDocuments = this.getTotalUploadDocumentsFromSessionProperty(req, totalUploadDocuments);
    const { files }: AppRequest<AnyObject> = req;

    req.session.errors = req.session.errors || [];
    if (isMarkDownLinkIncluded(req.body['documentRelevance'] as string)) {
      req.session.errors.push({ errorType: 'containsMarkdownLink', propertyName: 'documentRelevance' });
    }
    if (containsInvalidCharacters(req.body['documentRelevance'] as string)) {
      req.session.errors.push({ errorType: 'containsInvalidCharacters', propertyName: 'documentRelevance' });
    }
    if (isMarkDownLinkIncluded(req.body['additionalInformation'] as string)) {
      req.session.errors.push({ errorType: 'containsMarkdownLink', propertyName: 'additionalInformation' });
    }
    if (containsInvalidCharacters(req.body['additionalInformation'] as string)) {
      req.session.errors.push({ errorType: 'containsInvalidCharacters', propertyName: 'additionalInformation' });
    }

    if (req.session.errors?.length) {
      req.session.save(err => {
        if (err) {
          throw err;
        }
        res.redirect(this.getCurrentPageRedirectUrl());
      });
    } else if (saveAndContinue) {
      await this.postDocumentUploader(req, res);
    } else if (isNull(files)) {
      this.createUploadedFileError(req, res, chooseFileLink, 'NO_FILE_UPLOAD_ERROR');
    } else if (totalUploadDocuments < Number(config.get(this.getValidationTotal()))) {
      if (!req.session.hasOwnProperty('errors')) {
        req.session['errors'] = [];
      }

      const { documents }: any = files;

      const isValidMimeType: boolean = FileValidations.formatValidation(
        documents.mimetype,
        this.getAcceptedFileMimeType()
      );
      const isValidFileSize: boolean = FileValidations.sizeValidation(documents.size);

      if (!isValidFileSize) {
        this.createUploadedFileError(req, res, chooseFileLink, 'SIZE_ERROR');
      }

      if (!isValidMimeType) {
        this.createUploadedFileError(req, res, chooseFileLink, 'FORMAT_ERROR');
      }

      if (isValidMimeType && isValidFileSize) {
        await this.uploadDocument(documents, req, res, chooseFileLink);
      } else {
        this.redirect(req, res, this.getCurrentPageRedirectUrl());
      }
    } else {
      this.createUploadedFileError(req, res, filesUploadedLink, 'TOTAL_FILES_EXCEED_ERROR');

      this.redirect(req, res, this.getCurrentPageRedirectUrl());
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

  public getAcceptedFileMimeType(): Partial<Record<keyof FileType, keyof FileMimeTypeInfo>> {
    return {
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
  }

  private async addUploadedFileToData(
    headers: { authorization: string; serviceAuthorization: string },
    formData: FormData,
    formHeaders: FormData.Headers,
    req: AppRequest<AnyObject>
  ): Promise<void> {
    const requestDocument = await this.getRequestDocument(headers, formData, formHeaders);
    const uploadedDocument = requestDocument.data.document;
    if (req.body.documentRelevance !== undefined) {
      uploadedDocument.description = req.body.documentRelevance;
    }
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
    switch (errorType) {
      case 'NO_FILE_UPLOAD_ERROR':
        errorMessage = fileValidation.NO_FILE_UPLOAD_ERROR;
        break;
      case 'SIZE_ERROR':
        errorMessage = fileValidation.SIZE_ERROR;
        break;
      case 'FORMAT_ERROR':
        errorMessage = fileValidation.FORMAT_ERROR;
        break;
      case 'TOTAL_FILES_EXCEED_ERROR':
        errorMessage = fileValidation.TOTAL_FILES_EXCEED_ERROR;
        break;
      case 'CONTINUE_WITHOUT_UPLOAD_ERROR':
        errorMessage = fileValidation.CONTINUE_WITHOUT_UPLOAD_ERROR;
        break;
      case 'UPLOAD_DELETE_FAIL_ERROR':
      default:
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

  private async uploadDocument(
    documents: any,
    req: AppRequest<AnyObject>,
    res: Response<any, Record<string, any>>,
    chooseFileLink: string
  ) {
    const formData: FormData = new FormData();
    formData.append('file', documents.data, {
      contentType: documents.mimetype,
      filename: documents.name,
    });
    const formHeaders = formData.getHeaders();

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
  }
}
