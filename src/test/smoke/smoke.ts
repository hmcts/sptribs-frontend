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
      const url = new URL('/login', process.env.TEST_URL as string).toString();
      const expectedRedirectBase = config.get('services.idam.authorizationURL') as string;
      const response = await axios.get(url, {
        maxRedirects: 0,
        validateStatus: () => true,
      });
      const locationHeader = response.headers.location as string | undefined;

      if (
        response.status < 300 ||
        response.status >= 400 ||
        !locationHeader ||
        !locationHeader.startsWith(expectedRedirectBase)
      ) {
        throw new Error(
          `Status: ${response.status} URL: '${url}' Location: '${locationHeader}' Expected redirect base: '${expectedRedirectBase}'`
        );
      }
    };
    await expect(checkStartNow()).resolves.not.toThrow();
  });
});
