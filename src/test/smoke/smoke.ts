import axios from 'axios';
import config from 'config';

jest.retryTimes(20);
jest.setTimeout(5000);

const servicesToCheck = [
  { name: 'Special Tribunals Web', url: process.env.TEST_URL },
  { name: 'Special Tribunals Case API', url: config.get('services.ccd.url') },
  { name: 'IDAM Web', url: config.get('services.idam.authorizationURL') },
  { name: 'IDAM API', url: config.get('services.idam.tokenURL') },
  { name: 'Auth Provider', url: config.get('services.authProvider.url') },
  { name: 'Equality and Diversity', url: config.get('services.equalityAndDiversity.url') },
];

const checkService = async (url: string) => {
  const response = await axios.get(url);
  if (response.status !== 200 || response.data?.status !== 'UP') {
    throw new Error(`Status: ${response.status} Data: '${JSON.stringify(response.data)}'`);
  }
};

describe.each(servicesToCheck)('Required services should return 200 status UP', ({ name, url }) => {
  const parsedUrl = new URL('/health', url as string).toString();

  test(`${name}: ${parsedUrl}`, async () => {
    await expect(checkService(parsedUrl)).resolves.not.toThrow();
  });
});

describe('Start now should redirect to IDAM', () => {
  test('Start Now', async () => {
    const checkStartNow = async () => {
      const url: string = process.env.TEST_URL + '/login';
      const response = await axios.get(url as string);
      if (response.status !== 200 || !response.data.includes('password')) {
        throw new Error(`Status: ${response.status} Data: '${JSON.stringify(response.data)}'`);
      }
    };
    await expect(checkStartNow()).resolves.not.toThrow();
  });
});
