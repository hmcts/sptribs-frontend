import config from 'config';

import { ResourceReader } from '../../../main/modules/resourcereader/ResourceReader';
import { mockRequest } from '../../../test/unit/utils/mockRequest';
import * as steps from '../../steps';
import { SPTRIBS_CASE_API_BASE_URL } from '../../steps/common/constants/apiConstants';
import { YesOrNo } from '../case/definition';
import { isFieldFilledIn } from '../form/validation';

import { CASE_API_URL, FileValidations, UploadController } from './UploadController';

const getNextStepUrlMock = jest.spyOn(steps, 'getNextStepUrl');

describe('PostController', () => {
  afterEach(() => {
    getNextStepUrlMock.mockClear();
  });

  const testCurrentPageRedirectUrl = 'upload-appeal-form';

  describe('All of the listed Validation for files should be in place', () => {
    const allTypes = {
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

    it('must match the file validations type', () => {
      const mockForm = {
        fields: {
          field: {
            type: 'file',
            values: [{ label: l => l.no, value: YesOrNo.YES }],
            validator: isFieldFilledIn,
          },
        },
        submit: {
          text: l => l.continue,
        },
      };
      const controller = new UploadController(mockForm.fields);

      expect(Object.entries(allTypes)).toHaveLength(Object.entries(controller.getAcceptedFileMimeType()).length);
      expect(allTypes).toMatchObject(controller.getAcceptedFileMimeType());
      expect(Object.entries(allTypes).toString()).toBe(Object.entries(controller.getAcceptedFileMimeType()).toString());
    });

    describe('document format validation', () => {
      it('must match valid mimetypes', () => {
        const mockForm = {
          fields: {
            field: {
              type: 'file',
              values: [{ label: l => l.no, value: YesOrNo.YES }],
              validator: isFieldFilledIn,
            },
          },
          submit: {
            text: l => l.continue,
          },
        };
        const controller = new UploadController(mockForm.fields);

        expect(FileValidations.formatValidation('image/gif', controller.getAcceptedFileMimeType())).toBe(false);
        expect(FileValidations.formatValidation('application/msword', controller.getAcceptedFileMimeType())).toBe(true);
        expect(
          FileValidations.formatValidation(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            controller.getAcceptedFileMimeType()
          )
        ).toBe(true);
        expect(FileValidations.formatValidation('application/pdf', controller.getAcceptedFileMimeType())).toBe(true);
        expect(FileValidations.formatValidation('image/png', controller.getAcceptedFileMimeType())).toBe(true);
        expect(FileValidations.formatValidation('application/vnd.ms-excel', controller.getAcceptedFileMimeType())).toBe(
          true
        );
        expect(
          FileValidations.formatValidation(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            controller.getAcceptedFileMimeType()
          )
        ).toBe(true);
        expect(FileValidations.formatValidation('image/jpeg', controller.getAcceptedFileMimeType())).toBe(true);
        expect(FileValidations.formatValidation('text/plain', controller.getAcceptedFileMimeType())).toBe(true);
        expect(FileValidations.formatValidation('application/rtf', controller.getAcceptedFileMimeType())).toBe(true);
        expect(FileValidations.formatValidation('text/rtf', controller.getAcceptedFileMimeType())).toBe(true);
        expect(FileValidations.formatValidation('audio/mp4', controller.getAcceptedFileMimeType())).toBe(true);
        expect(FileValidations.formatValidation('video/mp4', controller.getAcceptedFileMimeType())).toBe(true);
        expect(FileValidations.formatValidation('audio/mpeg', controller.getAcceptedFileMimeType())).toBe(true);
      });
    });

    describe('The url must match the config url', () => {
      it('must match baseURl', () => {
        expect(CASE_API_URL).toBe(config.get(SPTRIBS_CASE_API_BASE_URL));
      });
    });

    describe('Checking for file upload size', () => {
      const file1Size = 10000000;
      const file2Size = 20000000;
      const file3Size = 700000001;
      const file4Size = 1000000001;
      it('Checking for file1 size', () => {
        expect(FileValidations.sizeValidation('text/plain', file1Size)).toBe(true);
      });

      it('Checking for file2 size', () => {
        expect(FileValidations.sizeValidation('text/plain', file2Size)).toBe(true);
      });

      it('Checking for file3 size', () => {
        expect(FileValidations.sizeValidation('text/plain', file3Size)).toBe(false);
      });

      it('Checking for file3 multimedia size', () => {
        expect(FileValidations.sizeValidation('video/mp4', file4Size)).toBe(false);
      });

      it('Checking for file4 multimedia size', () => {
        expect(FileValidations.sizeValidation('video/mp4', file4Size)).toBe(false);
      });
    });

    /**
     *      @UploadDocumentController
     *
     *      test for document upload controller
     */

    describe('Check for System contents to match for en', () => {
      const resourceLoader = new ResourceReader();
      resourceLoader.Loader(testCurrentPageRedirectUrl);
      const getContents = resourceLoader.getFileContents().errors;

      it('must match load English as Language', () => {
        const req = mockRequest({});
        req.query['lng'] = 'en';
        req.session['lang'] = 'en';
        const SystemContentLoader = FileValidations.ResourceReaderContents(req, testCurrentPageRedirectUrl);
        const getEnglishContents = getContents.en;
        expect(SystemContentLoader).toEqual(getEnglishContents);
      });
    });

    describe('Check for System contents to match for cy', () => {
      const resourceLoader = new ResourceReader();
      resourceLoader.Loader(testCurrentPageRedirectUrl);
      const getContents = resourceLoader.getFileContents().errors;

      it('must match load English as Language', () => {
        const req = mockRequest({});
        req.query['lng'] = 'cy';
        req.session['lang'] = 'cy';
        const SystemContentLoader = FileValidations.ResourceReaderContents(req, testCurrentPageRedirectUrl);
        const getWelshContents = getContents.cy;
        expect(SystemContentLoader).toEqual(getWelshContents);
      });
    });

    describe('Check for System contents to match for fr', () => {
      const resourceLoader = new ResourceReader();
      resourceLoader.Loader(testCurrentPageRedirectUrl);
      const getContents = resourceLoader.getFileContents().errors;

      it('must match load English as default Language', () => {
        const req = mockRequest({});
        req.query['lng'] = 'fr';
        req.session['lang'] = 'fr';
        const SystemContentLoader = FileValidations.ResourceReaderContents(req, testCurrentPageRedirectUrl);
        const getWelshContents = getContents.en;
        expect(SystemContentLoader).toEqual(getWelshContents);
      });
    });
  });
});
