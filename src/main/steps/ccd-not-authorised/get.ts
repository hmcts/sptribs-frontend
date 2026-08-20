import autobind from 'autobind-decorator';

import { GetController } from '../../app/controller/GetController';

import { generateContent } from './content';

@autobind
export default class CCDNotAuthorisedGetController extends GetController {
  constructor() {
    super('ccd-not-authorised/template', generateContent);
  }
}
