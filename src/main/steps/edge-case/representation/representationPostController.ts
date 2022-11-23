import autobind from 'autobind-decorator';
import { Response } from 'express';

import { AppRequest } from '../../../app/controller/AppRequest';
import { AnyObject, PostController } from '../../../app/controller/PostController';
import { Form, FormFields, FormFieldsFn } from '../../../app/form/Form';
import { USER_ROLE } from '../../urls';

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

    this.redirect(req, res, req.session.errors?.length ? req.url : USER_ROLE);

    // Replace line above with the block below once subsequent screens are done
    // if (YesOrNo.YES === req.body.representation) {
    //   this.redirect(req, res, req.session.errors?.length ? req.url : <URL1>);
    // } else {
    //   this.redirect(req, res, req.session.errors?.length ? req.url : <URL2>);
    // }
  }
}
