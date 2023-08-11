import { Logger } from '@hmcts/nodejs-logging';
import autobind from 'autobind-decorator';
import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios';
import config from 'config';
import { Response } from 'express';
import FormData from 'form-data';
import { isNull } from 'lodash';

import { getServiceAuthToken } from '../../../app/auth/service/get-service-auth-token';
import { mapCaseData } from '../../../app/case/CaseApi';
import { AppRequest } from '../../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../../app/controller/PostController';
import { Form, FormFields, FormFieldsFn } from '../../../app/form/Form';
import { ResourceReader } from '../../../modules/resourcereader/ResourceReader';
import { SPTRIBS_CASE_API_BASE_URL } from '../../../steps/common/constants/apiConstants';
const logger = Logger.getLogger('uploadDocumentPostController');
import { EQUALITY, UPLOAD_OTHER_INFORMATION } from '../../urls';

/**
 * ****** File Extensions Types are being check
 */
type URL_OF_FILE = string;

/**
 * ****** File Extensions Types are being check
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

/**
 * ****** File Upload validations Message
 */
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
  /**
   *
   * @param req
   * @returns
   */

  static ResourceReaderContents = (req: AppRequest<AnyObject>): FileUploadErrorTranslatables => {
    let SystemContent: any | FileUploadErrorTranslatables = {};
    const SystemLangauge = req.session['lang'];
    const resourceLoader = new ResourceReader();
    resourceLoader.Loader('upload-other-information');
    const ErrorInLangauges = resourceLoader.getFileContents().errors;
    switch (SystemLangauge) {
      case 'en':
        SystemContent = ErrorInLangauges.en;
        break;
      case 'cy':
        SystemContent = ErrorInLangauges.cy;
        break;
      default:
        SystemContent = ErrorInLangauges.en;
    }
    return SystemContent;
  };

  /**
   *
   * @param fileSize
   * @returns
   */
  static sizeValidation = (mimeType: string, fileSize: number): boolean => {
    const bytesInBytes =
      mimeType.startsWith('audio/') || mimeType.startsWith('video/')
        ? Number(config.get('documentUpload.validation.multimediaSizeInBytes'))
        : Number(config.get('documentUpload.validation.sizeInBytes'));
    if (fileSize <= bytesInBytes) {
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
export default class UploadDocumentController extends PostController<AnyObject> {
  constructor(protected readonly fields: FormFields | FormFieldsFn) {
    super(fields);
  }

  async PostDocumentUploader(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    if (req.session.hasOwnProperty('otherCaseInformation')) {
      const CaseId = req.session.userCase['id'];
      const baseURL = '/case/dss-orchestration/' + CaseId + '/update?event=UPDATE';
      const Headers = {
        Authorization: `Bearer ${req.session.user['accessToken']}`,
        ServiceAuthorization: getServiceAuthToken(),
      };
      try {
        let TribunalFormDocuments = [];
        if (req.session.caseDocuments !== undefined) {
          TribunalFormDocuments = req.session['caseDocuments'].map(document => {
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

        let SupportingDocuments = [];
        if (req.session.supportingCaseDocuments !== undefined) {
          SupportingDocuments = req.session['supportingCaseDocuments'].map(document => {
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
        let OtherInfoDocuments = [];
        if (req.session.otherCaseInformation !== undefined) {
          OtherInfoDocuments = req.session['otherCaseInformation'].map(document => {
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
        const CaseData = mapCaseData(req);
        const responseBody = {
          ...CaseData,
          TribunalFormDocuments,
          SupportingDocuments,
          OtherInfoDocuments,
        };
        await this.UploadDocumentInstance(CASE_API_URL, Headers).put(baseURL, responseBody);
        this.redirect(req, res, EQUALITY);
      } catch (error) {
        console.log(error);
        const errorMessage = FileValidations.ResourceReaderContents(req).UPLOAD_DELETE_FAIL_ERROR;
        this.uploadFileError(req, res, errorMessage);
      }
    }
  }

  public UploadDocumentInstance = (BASEURL: string, header: AxiosRequestHeaders): AxiosInstance => {
    return axios.create({
      baseURL: BASEURL,
      headers: header,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
  };

  private uploadFileError(req: AppRequest<AnyObject>, res: Response<any, Record<string, any>>, errorMessage?: string) {
    req.session.fileErrors.push({
      text: errorMessage,
      href: '#',
    });

    this.redirect(req, res, UPLOAD_OTHER_INFORMATION);
  }

  /**
   *
   * @param req
   * @param res
   */
  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const fields = typeof this.fields === 'function' ? this.fields(req.session.userCase) : this.fields;
    const form = new Form(fields);

    const { saveAndSignOut, saveBeforeSessionTimeout, _csrf, ...formData } = form.getParsedBody(req.body);

    req.session.errors = form.getErrors(formData);

    Object.assign(req.session.userCase, formData);

    const { documentUploadProceed } = req.body;

    let TotalUploadDocuments = 0;
    if (!req.session.hasOwnProperty('otherCaseInformation')) {
      req.session['otherCaseInformation'] = [];
    } else {
      TotalUploadDocuments = req.session['otherCaseInformation'].length;
      req.session['errors'] = [];
    }

    if (documentUploadProceed) {
      /**
       * @PostDocumentUploader
       */
      await this.PostDocumentUploader(req, res);
    } else {
      const { files }: AppRequest<AnyObject> = req;

      if (isNull(files)) {
        const errorMessage = FileValidations.ResourceReaderContents(req).NO_FILE_UPLOAD_ERROR;
        this.uploadFileError(req, res, errorMessage);
      } else {
        if (TotalUploadDocuments < Number(config.get('documentUpload.validation.totalOtherInformation'))) {
          if (!req.session.hasOwnProperty('errors')) {
            req.session['errors'] = [];
          }

          const { documents }: any = files;

          const checkIfMultipleFiles: boolean = Array.isArray(documents);

          // making sure single file is uploaded
          if (!checkIfMultipleFiles) {
            const validateMimeType: boolean = FileValidations.formatValidation(documents.mimetype);
            const validateFileSize: boolean = FileValidations.sizeValidation(documents.mimetype, documents.size);
            const formDataLocal: FormData = new FormData();
            if (validateMimeType && validateFileSize) {
              formDataLocal.append('file', documents.data, {
                contentType: documents.mimetype,
                filename: documents.name,
              });
              const formHeaders = formDataLocal.getHeaders();
              /**
               * @RequestHeaders
               */
              const Headers = {
                Authorization: `Bearer ${req.session.user['accessToken']}`,
                ServiceAuthorization: getServiceAuthToken(),
              };
              try {
                const RequestDocument = await this.UploadDocumentInstance(CASE_API_URL, Headers).post(
                  '/doc/dss-orchestration/upload?caseTypeOfApplication=CIC',
                  formDataLocal,
                  {
                    headers: {
                      ...formHeaders,
                    },
                  }
                );

                const uploadedDocument = RequestDocument.data.document;
                req.session['otherCaseInformation'].push(uploadedDocument);
                req.session['errors'] = undefined;
                this.redirect(req, res, UPLOAD_OTHER_INFORMATION);
              } catch (error) {
                logger.error(error);
                const errorMessage = FileValidations.ResourceReaderContents(req).UPLOAD_DELETE_FAIL_ERROR;
                this.uploadFileError(req, res, errorMessage);
              }
            } else {
              const FormattedError: any[] = [];
              if (!validateFileSize) {
                FormattedError.push({
                  text: FileValidations.ResourceReaderContents(req).SIZE_ERROR,
                  href: '#',
                });
              }

              if (!validateMimeType) {
                FormattedError.push({
                  text: FileValidations.ResourceReaderContents(req).FORMAT_ERROR,
                  href: '#',
                });
              }

              req.session.fileErrors.push(...FormattedError);

              this.redirect(req, res, UPLOAD_OTHER_INFORMATION);
            }
          }
        } else {
          req.session.fileErrors.push({
            text: FileValidations.ResourceReaderContents(req).TOTAL_FILES_EXCEED_ERROR,
            href: '#',
          });

          this.redirect(req, res, UPLOAD_OTHER_INFORMATION);
        }
      }
    }
  }
}
