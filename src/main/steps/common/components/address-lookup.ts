import { TranslationFn } from '../../../app/controller/GetController';
import { FormContent } from '../../../app/form/Form';
import { isInvalidPostcode } from '../../../app/form/validation';

const en = () => ({
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
  manualAddressUrl: '#',
});

const cy = () => ({
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
  manualAddressUrl: '#',
});

export const form: FormContent = {
  fields: {
    addressPostcode: {
      type: 'text',
      classes: 'govuk-label govuk-input--width-10',
      label: l => l.postcode,
      labelSize: 'm',
      attributes: {
        maxLength: 14,
      },
      validator: isInvalidPostcode,
    },
  },
  submit: {
    text: l => l.findAddress,
  },
};

const languages = {
  en,
  cy,
};

export const generateContent: TranslationFn = content => {
  const translations = languages[content.language]();
  return {
    ...translations,
    form,
  };
};
