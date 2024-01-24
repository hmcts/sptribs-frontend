import autobind from 'autobind-decorator';

import { UploadController } from '../../../app/controller/UploadController';
import { FormFields, FormFieldsFn } from '../../../app/form/Form';

@autobind
export default class UploadDocumentController extends UploadController {
  constructor(protected readonly fields: FormFields | FormFieldsFn) {
    super(fields);
  }
}
