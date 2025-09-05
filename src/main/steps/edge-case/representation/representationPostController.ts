import autobind from 'autobind-decorator';
import { Response } from 'express';

import { YesOrNo } from '../../../app/case/definition';
import { AppRequest } from '../../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../../app/controller/PostController';
import { Form, FormFields, FormFieldsFn } from '../../../app/form/Form';
import { CICA_REFERENCE_NUMBER, REPRESENTATION_QUALIFIED } from '../../urls';

@autobind
export default class RepresentationPostController extends PostController<AnyObject> {
  constructor(protected readonly fields: FormFields | FormFieldsFn) {
    super(fields);
  }

  public async post(req: AppRequest<AnyObject>, res: Response): Promise<void> {
    const fields = typeof this.fields === 'function' ? this.fields(req.session.userCase) : this.fields;
    const form = new Form(fields);

    const { saveAndSignOut, saveBeforeSessionTimeout, _csrf, ...formData } = form.getParsedBody(req.body);

    req.session.errors = form.getErrors(formData);

    Object.assign(req.session.userCase, formData);

    if (YesOrNo.YES === req.body.representation) {
      this.redirect(req, res, req.session.errors?.length ? req.url : REPRESENTATION_QUALIFIED);
    } else {
      this.redirect(req, res, req.session.errors?.length ? req.url : CICA_REFERENCE_NUMBER);
    }
  }
}
