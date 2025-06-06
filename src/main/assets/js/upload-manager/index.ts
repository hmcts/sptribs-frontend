import { Uppy } from '@uppy/core';
import DropTarget from '@uppy/drop-target';
import FileInput from '@uppy/file-input';
import ProgressBar from '@uppy/progress-bar';
import XHRUpload from '@uppy/xhr-upload';

import { DOCUMENT_UPLOAD_URL } from '../../../steps/urls';
import { getById, hidden, qs } from '../selectors';

import { FileUploadEvents } from './FileUploadEvents';
import { UploadedFiles } from './UploadedFiles';
import { updateFileList } from './updateFileList';

import '@uppy/drop-target/src/style.scss';
import '@uppy/progress-bar/src/style.scss';

const initUploadManager = (): void => {
  const url = DOCUMENT_UPLOAD_URL;
  const csrfToken = (getById('csrfToken') as HTMLInputElement)?.value;
  const locale = (getById('locale') as HTMLInputElement)?.value;
  const csrfQuery = `?_csrf=${csrfToken}`;
  location.hash = '';

  let chooseFilePhoto;
  if (locale === 'cy') {
    chooseFilePhoto = 'Dewiswch ffeil';
  } else {
    chooseFilePhoto = 'Choose a file';
  }

  const uppy = new Uppy({
    restrictions: {
      maxFileSize: 10197152,
      maxTotalFileSize: 511485760,
      maxNumberOfFiles: 10,
      allowedFileTypes: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf',
      ],
    },
  });

  const uploadedFiles = new UploadedFiles();
  const fileUploadEvents = new FileUploadEvents(uppy);
  updateFileList(uploadedFiles);

  uppy
    .use(FileInput, {
      target: '#upload',
      locale: {
        strings: {
          chooseFiles: chooseFilePhoto,
        },
      },
    })
    .use(DropTarget, { target: document.body })
    .use(ProgressBar, {
      target: '#uploadProgressBar',
      hideAfterFinish: true,
    })
    .use(XHRUpload, { endpoint: `${url}${csrfQuery}`, bundle: true, headers: { accept: 'application/json' } })
    .on('files-added', async () => {
      document.body.style.cursor = 'wait';
      try {
        await fileUploadEvents.onFilesSelected(uppy, uploadedFiles);
        updateFileList(uploadedFiles);
      } finally {
        uppy.cancelAll();
        document.body.style.cursor = 'default';
        getById('uploadGroup')?.focus();
      }
    })
    .on('error', fileUploadEvents.onError);
};

const upload = qs('.upload');
if (upload) {
  upload.classList.remove(hidden);
  initUploadManager();
}
