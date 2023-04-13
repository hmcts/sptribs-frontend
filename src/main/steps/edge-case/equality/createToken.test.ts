import { v4 as uuid } from 'uuid';

import { CHECK_YOUR_ANSWERS } from '../../urls';

import { createToken } from './createToken';

describe('createToken', () => {
  const params = {
    serviceId: 'SpecialTribunals_CIC',
    actor: 'APPLICANT',
    pcqId: uuid(),
    partyId: 'test@email.com',
    returnUrl: CHECK_YOUR_ANSWERS,
    language: 'en',
    token: '',
  };

  test('Should create token if tokenKey exists', async () => {
    const result = await createToken(params, 'PCQ_TOKEN');

    expect(result).toHaveLength(382);
  });
});
