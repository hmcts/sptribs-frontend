import { FormContent, FormFields, FormOptions } from '../../../app/form/Form';
import { isInvalidPostcode } from '../../../app/form/validation';
import { CommonContent } from '../../common/common.content';

import { generateContent } from './address-lookup';

jest.mock('../../../app/form/validation');

const enContent = {
  line1:
    "We'll send all court papers to this address unless you advise us that you are happy to be served court orders by email.",
  postcode: 'Postcode',
  findAddress: 'Find address',
  enterAddressManually: 'Or enter address manually',
  errors: {
    addressPostcode: {
      required: 'Enter a real postcode',
      invalid: 'Enter a real postcode',
    },
  },
};

const cyContent = {
  line1:
    "Byddwn yn anfon holl bapurau'r llys i'r cyfeiriad hwn oni bai eich bod yn rhoi gwybod i ni eich bod yn hapus i gael gorchmynion llys trwy e-bost.",
  postcode: 'God post',
  findAddress: 'Dod o hyd i gyfeiriad',
  enterAddressManually: 'Neu nodwch y cyfeiriad â llaw',
  errors: {
    addressPostcode: {
      required: 'Nodwch god post dilys',
      invalid: 'Nodwch god post dilys',
    },
  },
};

/* eslint-disable @typescript-eslint/ban-types */
describe('common > components > address-lookup > content', () => {
  const commonContent = { language: 'en', userCase: {} } as CommonContent;
  let generatedContent;

  beforeEach(() => {
    generatedContent = generateContent(commonContent);
  });

  test('should return correct english content', () => {
    expect(generatedContent.line1).toEqual(enContent.line1);
    expect(generatedContent.postcode).toEqual(enContent.postcode);
    expect(generatedContent.findAddress).toEqual(enContent.findAddress);
    expect(generatedContent.enterAddressManually).toEqual(enContent.enterAddressManually);
    expect(generatedContent.errors).toEqual(enContent.errors);
    expect(generatedContent.manualAddressUrl).toEqual('#');
  });

  test('should return correct welsh content', () => {
    generatedContent = generateContent({ ...commonContent, language: 'cy' });
    expect(generatedContent.line1).toEqual(cyContent.line1);
    expect(generatedContent.postcode).toEqual(cyContent.postcode);
    expect(generatedContent.findAddress).toEqual(cyContent.findAddress);
    expect(generatedContent.enterAddressManually).toEqual(cyContent.enterAddressManually);
    expect(generatedContent.errors).toEqual(cyContent.errors);
    expect(generatedContent.manualAddressUrl).toEqual('#');
  });

  test('should contain addressPostcode field', () => {
    const form = generatedContent.form as FormContent;
    const fields = form.fields as FormFields;
    const addressPostcodeField = fields.addressPostcode as FormOptions;

    expect(addressPostcodeField.type).toBe('text');
    expect(addressPostcodeField.classes).toBe('govuk-label govuk-input--width-10');
    expect((addressPostcodeField.label as Function)(generatedContent)).toBe('Postcode');
    expect(addressPostcodeField.labelSize).toBe('m');
    expect(addressPostcodeField.attributes!.maxLength).toBe(14);
    expect(addressPostcodeField.validator).toBe(isInvalidPostcode);
  });

  test('should contain find address button', () => {
    const form = generatedContent.form as FormContent;
    expect((form.submit?.text as Function)(generatedContent)).toBe('Find address');
  });
});
/* eslint-enable @typescript-eslint/ban-types */
