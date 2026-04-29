import autobind from 'autobind-decorator';

import { GetController } from '../../app/controller/GetController';

import { generateContent } from './content';

@autobind
export default class CicaConfirmNewGetController extends GetController {
  constructor() {
    super('cica-confirm-new/template', generateContent);
  }
}
