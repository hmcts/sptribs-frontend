require('./e2e/helpers/event_listener');
import lodash from 'lodash';

export const config: CodeceptJS.Config = {
  output: './output',
  multiple: {
    parallel: {
      chunks: files => {
        const splitFiles = (list, size) => {
          const sets: any[] = [];
          const chunks: number = list.length / size;
          let i: number = 0;

          while (i < chunks) {
            sets[i] = list.splice(0, size);
            i++;
          }
          return sets;
        };

        const buckets: number = parseInt(process.env.PARALLEL_CHUNKS || '1');
        const slowTests: any[] = lodash.filter(files, file => file.includes('@slow'));
        const otherTests: any[] = lodash.difference(files, slowTests);

        let chunks: any[] = [];
        if (buckets > slowTests.length + 1) {
          const slowTestChunkSize: number = 1;
          const regularChunkSize: number = Math.ceil((files.length - slowTests.length) / (buckets - slowTests.length));
          chunks = lodash.union(splitFiles(slowTests, slowTestChunkSize), splitFiles(otherTests, regularChunkSize));
        } else {
          chunks = splitFiles(files, Math.ceil(files.length / buckets));
        }

        console.log(chunks);

        return chunks;
      },
    },
    crossBrowser: {
      browsers: [
        { browser: 'firefox' },
        { browser: 'webkit' },
        { browser: 'chromium' },
        { browser: 'webkit', device: 'iPhone 13' },
      ],
    },
  },
  helpers: {
    Playwright: {
      show: process.env.SHOW_BROWSER_WINDOW || false,
      waitForTimeout: parseInt(process.env.WAIT_FOR_TIMEOUT || '30000'),
      browser: 'chromium',
      chromium: {
        ignoreHTTPSErrors: true,
        args: process.env.DISABLE_WEB_SECURITY === 'true' ? ['--disable-web-security'] : [],
        devtools: process.env.SHOW_BROWSER_WINDOW || false,
      },
      windowSize: '1280x960',
    },
    HooksHelper: {
      require: './e2e/helpers/hooks_helper.js',
    },
    BrowserHelpers: {
      require: './e2e/helpers/browser_helper.js',
    },
    DumpBrowserLogsHelper: {
      require: './e2e/helpers/dump_browser_logs_helper.js',
    },
    StepListener: {
      require: './e2e/helpers/stepListener.js',
    },
    Mochawesome: {
      uniqueScreenshotNames: true,
    },
  },

  include: {
    config: './e2e/config.js',
    I: './e2e/actors/main.js',
    loginPage: './e2e/pages/login.page.js',
    landingPage: './e2e/pages/LandingPage.js',
    subjectDetailsPage: './e2e/pages/SubjectDetails.page.js',
    subjectContactDetailsPage: './e2e/pages/SubjectContactDetails.page.js',
    representationPage: './e2e/pages/Representation.page.js',
    representationQualifiedPage: './e2e/pages/RepresentationQualified.page.js',
    representativeDetailsPage: './e2e/pages/RepresentativeDetails.page.js',
    uploadAppealForm: './e2e/pages/UploadAppealForm.page.js',
    uploadSupportingDocuments: './e2e/pages/UploadSupportingDocuments.page.js',
    uploadOtherInformation: './e2e/pages/UploadOtherInformation.page.js',
    checkYourAnswersPage: './e2e/pages/CheckYourAnswers.page.js',
    applicationSubmittedPage: './e2e/pages/applicationSubmitted.page.js',
  },
  plugins: {
    retryFailedStep: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true,
    },
  },
  tests: './e2e/tests/*_test.*',
  teardownAll: require('./e2e/hooks/aggregate-metrics'),
  mocha: {
    reporterOptions: {
      'codeceptjs-cli-reporter': {
        stdout: '-',
        options: {
          steps: false,
        },
      },
      'mocha-junit-reporter': {
        stdout: '-',
        options: {
          mochaFile: 'test-results/result.xml',
        },
      },
      mochawesome: {
        stdout: '-',
        options: {
          reportDir: './output',
          inlineAssets: true,
          json: false,
        },
      },
      '../../src/test/e2e/reporters/json-file-reporter/reporter': {
        stdout: '-',
      },
    },
  },
};