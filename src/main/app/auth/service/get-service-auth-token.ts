import { Logger } from '@hmcts/nodejs-logging';
import axios from 'axios';
import config from 'config';
import { generate } from 'otplib';

const logger = Logger.getLogger('service-auth-token');
let token;

export const getTokenFromApi = async (): Promise<void> => {
  logger.info('Refreshing service auth token');

  const url: string = config.get('services.authProvider.url') + '/lease';
  const microservice: string = config.get('services.authProvider.microservice');
  const secret: string = config.get('services.authProvider.secret');
  const oneTimePassword = await generate({ secret });
  const body = { microservice, oneTimePassword };

  try {
    const response = await axios.post(url, body);
    token = response.data;
  } catch (err) {
    logger.error(err.response?.status, err.response?.data);
  }
};

export const initAuthToken = async (): Promise<void> => {
  await getTokenFromApi();
  setInterval(getTokenFromApi, 1000 * 60 * 60);
};

export const getServiceAuthToken = (): string => {
  return token;
};
