import autobind from 'autobind-decorator';

import { GetController } from '../../app/controller/GetController';

import { generateContent } from './content';

@autobind
export default class PostcodeErrorGetController extends GetController {
  constructor() {
    super('postcode-error/template', generateContent);
  }
}
