require('./src/test/e2e/helpers/event_listener');
const lodash = require('lodash');

exports.config = {
  output: './output',
  multiple: {
    parallel: {
      chunks: files => {
        const splitFiles = (list, size) => {
          const sets = [];
          const chunks = list.length / size;
          let i = 0;

          while (i < chunks) {
            sets[i] = list.splice(0, size);
            i++;
          }
          return sets;
        };

        const buckets = parseInt(process.env.PARALLEL_CHUNKS || '1');
        const slowTests = lodash.filter(files, file => file.includes('@slow'));
        const otherTests = lodash.difference(files, slowTests);

        let chunks = [];
        if (buckets > slowTests.length + 1) {
          const slowTestChunkSize = 1;
          const regularChunkSize = Math.ceil((files.length - slowTests.length) / (buckets - slowTests.length));
          chunks = lodash.union(splitFiles(slowTests, slowTestChunkSize), splitFiles(otherTests, regularChunkSize));
        } else {
          chunks = splitFiles(files, Math.ceil(files.length / buckets));
        }

        console.log(chunks);

        return chunks;
      },
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
      require: './src/test/e2e/helpers/hooks_helper.js',
    },
    BrowserHelpers: {
      require: './src/test/e2e/helpers/browser_helper.js',
    },
    DumpBrowserLogsHelper: {
      require: './src/test/e2e/helpers/dump_browser_logs_helper.js',
    },
    StepListener: {
      require: './src/test/e2e/helpers/stepListener.js',
    },
    Mochawesome: {
      uniqueScreenshotNames: true,
    },
  },
  multiple: {
    crossBrowser: {
      browsers: [
        { browser: 'firefox'},
        { browser: 'webkit'},
        { browser: 'chromium'},
        { browser: 'webkit', device: 'iPhone 13'}
      ]
    }
  },

  include: {
    config: './src/test/e2e/config.js',
    I: './src/test/e2e/actors/main.js',
    loginPage: './src/test/e2e/pages/login.page.js',
    landingPage: './src/test/e2e/pages/LandingPage.js',
    subjectDetailsPage: './src/test/e2e/pages/SubjectDetails.page.js',
    subjectContactDetailsPage: './src/test/e2e/pages/SubjectContactDetails.page.js',
    representationPage: './src/test/e2e/pages/Representation.page.js',
    representationQualifiedPage: './src/test/e2e/pages/RepresentationQualified.page.js',
    representativeDetailsPage: './src/test/e2e/pages/RepresentativeDetails.page.js',
    uploadAppealForm: './src/test/e2e/pages/UploadAppealForm.page.js',
    uploadSupportingDocuments: './src/test/e2e/pages/UploadSupportingDocuments.page.js',
    uploadOtherInformation: './src/test/e2e/pages/UploadOtherInformation.page.js',
    checkYourAnswersPage: './src/test/e2e/pages/CheckYourAnswers.page.js',
    applicationSubmittedPage: './src/test/e2e/pages/applicationSubmitted.page.js',
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
  tests: './src/test/e2e/tests/*_test.js',
  teardownAll: require('./src/test/e2e/hooks/aggregate-metrics'),
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
