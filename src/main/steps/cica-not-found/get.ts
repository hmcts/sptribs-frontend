import autobind from 'autobind-decorator';

import { GetController } from '../../app/controller/GetController';

import { generateContent } from './content';

@autobind
export default class CicaNotFoundGetController extends GetController {
  constructor() {
    super('cica-not-found/template', generateContent);
  }
}
