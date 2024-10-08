import { StatusCodes } from 'http-status-codes';

const common = {
  en: {
    info: 'This could be because you’ve followed a broken or outdated link, or because there’s an error on our site.',
    youCan: 'You can either:',
    goBack: 'go back to the previous page',
    signInAgain: 'sign in again',
  },
  cy: {
    info: 'Efallai eich bod wedi defnyddio dolen nad yw’n gweithio neu hen ddolen, neu bod yna nam ar ein safle.',
    youCan: 'Gallwch:',
    goBack: 'fynd yn ôl i’r dudalen flaenorol',
    signInAgain: 'mewngofnodi eto',
  },
};

const en = {
  [StatusCodes.BAD_REQUEST]: {
    ...common.en,
    title: 'Bad request',
  },
  [StatusCodes.NOT_FOUND]: {
    ...common.en,
    title: 'Page not found',
  },
  [StatusCodes.INTERNAL_SERVER_ERROR]: {
    ...common.en,
    title: 'An error has occurred',
    info: 'There was a problem with your last action. Go back and try again.<br><br>If the problem persists contact the Tribunal. <br><br>Find a court or tribunal - <a href=https://www.gov.uk/criminal-injuries-compensation-tribunal/appeal-to-tribunal>GOV.UK</a><br><br><br>',
  },
};

const cy: typeof en = {
  [StatusCodes.BAD_REQUEST]: {
    ...common.cy,
    title: 'Cais gwael',
  },
  [StatusCodes.NOT_FOUND]: {
    ...common.cy,
    title: 'Ni ellir dod o hyd i’r dudalen',
  },
  [StatusCodes.INTERNAL_SERVER_ERROR]: {
    ...common.cy,
    title: 'Mae gwall wedi digwydd',
    info: "Roedd yna broblem gyda’ch gweithred ddiwethaf. Ewch yn ôl a rhowch gynnig arall arni. Os bydd y broblem yn parhau, cysylltwch â'r Tribiwnlys. <br><br>Dod o hyd i lys neu dribiwnlys - <a href=https://www.gov.uk/criminal-injuries-compensation-tribunal/appeal-to-tribunal>GOV.UK</a><br><br><br>",
  },
};

export const errorContent = { en, cy };
