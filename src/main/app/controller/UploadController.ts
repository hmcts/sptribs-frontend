import { Logger } from '@hmcts/nodejs-logging';
import autobind from 'autobind-decorator';
import config from 'config';
import { Response } from 'express';
import { isNull } from 'lodash';

import { AppRequest } from '../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../app/controller/PostController';
import { Form, FormFields, FormFieldsFn } from '../../app/form/Form';
import { ResourceReader } from '../../modules/resourcereader/ResourceReader';
import { UPLOAD_APPEAL_FORM, UPLOAD_SUPPORTING_DOCUMENTS } from '../../steps/urls';
import { CaseDocument } from '../case/case';
import { CITIZEN_CIC_UPDATE_CASE } from '../case/definition';
import { fromApiFormat } from '../case/from-api-format';
import { Classification, DocumentManagementFile } from '../document/CaseDocumentManagementClient';
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

        const caseId = req.session.userCase['id'];
        const eventTrigger = await req.locals.api.getEventTrigger(caseId, CITIZEN_CIC_UPDATE_CASE);
        const caseData = eventTrigger.case_details?.data ? fromApiFormat(eventTrigger.case_details.data) : undefined;

        const responseBody = {
          tribunalFormDocuments: this.mergeDocuments(caseData?.tribunalFormDocuments, req.session.caseDocuments || []),
          supportingDocuments: this.mergeDocuments(
            caseData?.supportingDocuments,
            req.session.supportingCaseDocuments || []
          ),
          otherInfoDocuments: this.mergeDocuments(caseData?.otherInfoDocuments, req.session.otherCaseInformation || []),
          additionalInformation: req.session.userCase.additionalInformation,
        };

        req.session.userCase = await req.locals.api.triggerEvent(
          caseId,
          responseBody,
          CITIZEN_CIC_UPDATE_CASE,
          eventTrigger.token
        );

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

  private mergeDocuments(
    existingDocs: CaseDocument[] = [],
    uploadedDocs: DocumentManagementFile[] = []
  ): CaseDocument[] {
    const currentDocs = existingDocs.filter(Boolean);
    const newDocs = this.getCaseDocuments(uploadedDocs);
    const seenIds = new Set(currentDocs.map(doc => doc.id));

    for (const doc of newDocs) {
      if (!seenIds.has(doc.id)) {
        currentDocs.push(doc);
        seenIds.add(doc.id);
      }
    }

    return currentDocs;
  }

  private getCaseDocuments(documents: DocumentManagementFile[]): CaseDocument[] {
    return documents.map(document => {
      const documentId = document._links.self.href.split('/').pop();

      return {
        id: documentId!,
        value: {
          documentLink: {
            document_url: document._links.self.href,
            document_filename: document.originalDocumentName,
            document_binary_url: document._links.binary.href,
          },
          comment: document.description || null,
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
    } else if (isNull(req.files)) {
      this.createUploadedFileError(req, res, chooseFileLink, 'NO_FILE_UPLOAD_ERROR');
    } else if (totalUploadDocuments < Number(config.get(this.getValidationTotal()))) {
      if (!req.session.hasOwnProperty('errors')) {
        req.session['errors'] = [];
      }

      const { documents }: any = req.files;

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
        await this.uploadDocument(req, res, chooseFileLink);
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

  private getTotalUploadDocumentsFromSessionProperty(req: AppRequest<AnyObject>, totalUploadDocuments: number): number {
    if (!req.session.hasOwnProperty(this.getPropertyName())) {
      req.session[this.getPropertyName()] = [];
    } else {
      totalUploadDocuments = req.session[this.getPropertyName()].length;
      req.session['errors'] = [];
    }
    return totalUploadDocuments;
  }

  private async uploadDocument(req: AppRequest, res: Response, chooseFileLink: string) {
    try {
      const newDocument = (
        await req.locals.documentApi.create({
          files: req.files!,
          classification: Classification.Public,
        })
      )[0];

      if (req.body.documentRelevance) {
        newDocument.description = req.body.documentRelevance;
      }

      req.session[this.getPropertyName()].push(newDocument);
      req.session.save(() => this.redirect(req, res, this.getCurrentPageRedirectUrl()));
    } catch (error) {
      logger.error(error);
      this.createUploadedFileError(req, res, chooseFileLink, 'UPDATE_DELETE_FAIL_ERROR');
    }
  }
}
