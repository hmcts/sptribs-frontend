import { GetController } from '../../app/controller/GetController';

import { generateContent } from './content';

export class ContactUsGetController extends GetController {
  constructor() {
    super(__dirname + '/contact-us', generateContent);
  }
}
