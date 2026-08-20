import autobind from 'autobind-decorator';

import { GetController } from '../../app/controller/GetController';

import { generateContent } from './content';

@autobind
export default class CCDLookupGetController extends GetController {
  constructor() {
    super('cica-lookup/template', generateContent);
  }
}
