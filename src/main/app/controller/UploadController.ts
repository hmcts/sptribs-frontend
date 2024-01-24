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
import { FormFields, FormFieldsFn } from '../../app/form/Form';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';
import { SPTRIBS_CASE_API_BASE_URL } from '../../steps/common/constants/apiConstants';
const logger = Logger.getLogger('uploadDocumentPostController');

type URL_OF_FILE = string;

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

export const CASE_API_URL: URL_OF_FILE = config.get(SPTRIBS_CASE_API_BASE_URL);

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
    static ResourceReaderContents = (req: AppRequest<AnyObject>, page: string): FileUploadErrorTranslatables => {
      let SystemContent: any | FileUploadErrorTranslatables = {};
      const SystemLanguage = req.session['lang'];
      const resourceLoader = new ResourceReader();
      resourceLoader.Loader(page);
      const ErrorInLanguages = resourceLoader.getFileContents().errors;
      switch (SystemLanguage) {
        case 'en':
          SystemContent = ErrorInLanguages.en;
          break;
        case 'cy':
          SystemContent = ErrorInLanguages.cy;
          break;
        default:
          SystemContent = ErrorInLanguages.en;
      }
      return SystemContent;
    };

  /**
     *
     * @param fileSize
     * @returns
     */
  static sizeValidation = (mimeType: string, fileSize: number): boolean => {
    const bytes = 
      mimeType.startsWith('audio/') || mimeType.startsWith('video/')
        ? Number(config.get('documentUpload.validation.multimediaSizeInBytes'))
        : Number(config.get('documentUpload.validation.sizeInBytes'));//careful mb and b difference
    if (fileSize <= bytes) {
      return true;
    } else {
      return false;
    }
  };

  /**
   *
   * @param mimeType
   * @returns
   */
  static formatValidation = (mimeType: string): boolean => {
      const allMimeTypes = Object.values(FileMimeType);
      const checkForFileMimeType = allMimeTypes.filter(aMimeType => aMimeType === mimeType);
      return checkForFileMimeType.length > 0;
  };  
}

@autobind
export class UploadController extends PostController<AnyObject> {
  constructor(protected readonly fields: FormFields | FormFieldsFn) {
    super(fields);
  }

  async PostDocumentUploader(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const chooseFileLink = '#file-upload-1';
    let TotalUploadDocuments;
    if (req.session.hasOwnProperty(this.getPropertyName())) {
      TotalUploadDocuments = req.session[this.getPropertyName()].length;
    if (TotalUploadDocuments === 0 && this.checkIfNoFilesUploaded()) {
      this.createUploadedFileError(req, res, chooseFileLink, 'CONTINUE_WITHOUT_UPLOAD_ERROR');
    } else {
      const CaseId = req.session.userCase['id'];
      const baseURL = '/case/dss-orchestration/' + CaseId + '/update?event=UPDATE';
      const Headers = {
        Authorization: `Bearer ${req.session.user['accessToken']}`,
        ServiceAuthorization: getServiceAuthToken(),
      };
      try {
        let TribunalFormDocuments = [];
        let SupportingDocuments = [];
        let OtherInfoDocuments = [];
        if (req.session.caseDocuments !== undefined) {
          TribunalFormDocuments = this.getTribunalFormDocuments(req);  
        }
        if (req.session.supportingCaseDocuments !== undefined) {
          SupportingDocuments = this.getSupportingDocuments(req);
        }   
        if (req.session.otherCaseInformation !== undefined) {
          OtherInfoDocuments = this.getOtherInfoDocuments(req);
        }  
        const CaseData = mapCaseData(req);
          const responseBody = {
            ...CaseData,
            TribunalFormDocuments,
            SupportingDocuments,
            OtherInfoDocuments,
          };
          await this.UploadDocumentInstance(CASE_API_URL, Headers).put(baseURL, responseBody);
          res.redirect(this.getNextPageRedirectUrl());  
        } catch (error) {
          this.createUploadedFileError(req, res, chooseFileLink, 'UPLOAD_DELETE_FAIL_ERROR');
        }    
      }
    }
  }

  public UploadDocumentInstance = (BASEURL: string, header: RawAxiosRequestHeaders): AxiosInstance => {
    return axios.create({
      baseURL: BASEURL,
      headers: header,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
  };

  private getOtherInfoDocuments(req: AppRequest<AnyObject>) {
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

  private getSupportingDocuments(req: AppRequest<AnyObject>) {
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

  private getTribunalFormDocuments(req: AppRequest<AnyObject>) {
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

  public uploadFileError(
    req: AppRequest<AnyObject>,
    res: Response<any, Record<string, any>>,
    redirectUrlIfError: string,
    errorMessage?: string,
    link?: string
  ) {
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
  public async submit(req: AppRequest<AnyObject>, res: Response<any, Record<string, any>>) {
    const chooseFileLink = '#file-upload-1';
    const filesUploadedLink = '#filesUploaded';
    const { documentUploadProceed } = req.body;

    let TotalUploadDocuments = 0;
    TotalUploadDocuments = this.getTotalUploadDocumentsFromSessionProperty(req, TotalUploadDocuments);

    if (documentUploadProceed) {
      /**
       * @PostDocumentUploader
       */
      this.PostDocumentUploader(req, res);
    } else {
      const { files }: AppRequest<AnyObject> = req;

      if (isNull(files)) {
        this.createUploadedFileError(req, res, chooseFileLink, 'NO_FILE_UPLOAD_ERROR');
      } else {
        if (TotalUploadDocuments < Number(config.get(this.getValidationTotal()))) {
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
              const Headers = {
                Authorization: `Bearer ${req.session.user['accessToken']}`,
                ServiceAuthorization: getServiceAuthToken(),
              };
              try {
                await this.addUploadedFileToData(Headers, formData, formHeaders, req);
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
  }

  //get methods overridden in subclasses
  protected getPropertyName() {
    return '';
  }

  protected getNextPageRedirectUrl() {
    return '';
  }

  protected getCurrentPageRedirectUrl() {
    return '';
  }

  protected getValidationTotal() {
    return '';
  }

  protected checkIfNoFilesUploaded() {
    return true;
  }

  private async addUploadedFileToData(Headers: { Authorization: string; ServiceAuthorization: string; }, formData: FormData, formHeaders: FormData.Headers, req: AppRequest<AnyObject>) {
    const RequestDocument = await this.getRequestDocument(Headers, formData, formHeaders);
    const uploadedDocument = RequestDocument.data.document;
    req.session[this.getPropertyName()].push(uploadedDocument);
    req.session['errors'] = undefined;
  }

  private createUploadedFileError(req: AppRequest<AnyObject>, res: Response<any, Record<string, any>>, fileLink: string, errorType: string) {
    let errorMessage;
    let fileValidation = FileValidations.ResourceReaderContents(req, this.getCurrentPageRedirectUrl());
    if (errorType == 'NO_FILE_UPLOAD_ERROR') {
      errorMessage = fileValidation.NO_FILE_UPLOAD_ERROR;
    }
    else if (errorType == 'SIZE_ERROR') {
      errorMessage = fileValidation.SIZE_ERROR;
    }
    else if (errorType == 'FORMAT_ERROR') {
      errorMessage = fileValidation.FORMAT_ERROR;
    }
    else if (errorType == 'TOTAL_FILES_EXCEED_ERROR') {
      errorMessage = fileValidation.TOTAL_FILES_EXCEED_ERROR;
    }
    else if (errorType == 'CONTINUE_WITHOUT_UPLOAD_ERROR') {
      errorMessage = fileValidation.CONTINUE_WITHOUT_UPLOAD_ERROR;
    }
    else {
      errorMessage = fileValidation.UPLOAD_DELETE_FAIL_ERROR;
    }
    this.uploadFileError(req, res, this.getCurrentPageRedirectUrl(), errorMessage, fileLink);
  }

  private async getRequestDocument(Headers: { Authorization: string; ServiceAuthorization: string; }, formData: FormData, formHeaders: FormData.Headers) {
    return await this.UploadDocumentInstance(CASE_API_URL, Headers).post(
      '/doc/dss-orchestration/upload?caseTypeOfApplication=CIC',
      formData,
      {
        headers: {
          ...formHeaders,
          ServiceAuthorization: getServiceAuthToken(),
        },
      }
    );
  }

  private getTotalUploadDocumentsFromSessionProperty(req: AppRequest<AnyObject>, TotalUploadDocuments: number) {
    if (!req.session.hasOwnProperty(this.getPropertyName())) {
      req.session[this.getPropertyName()] = [];
    } else {
      TotalUploadDocuments = req.session[this.getPropertyName()].length;
      req.session['errors'] = [];
    }
    return TotalUploadDocuments;
  }
}