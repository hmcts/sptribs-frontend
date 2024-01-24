import autobind from 'autobind-decorator';

import { FormFields, FormFieldsFn } from '../../../app/form/Form';
import { UploadController } from '../../../app/controller/UploadController';

@autobind
export default class UploadDocumentController extends UploadController {
  constructor(protected readonly fields: FormFields | FormFieldsFn) {
    super(fields);
  }
}
