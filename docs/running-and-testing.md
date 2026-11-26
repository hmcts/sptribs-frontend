# Running and testing

## Prerequisites

| Tool | Notes |
|---|---|
| Node.js | Node 22, as used by the `Dockerfile`. `package.json` accepts 18.16 or later |
| Yarn | Yarn 4, enabled with `corepack enable` |
| Azure CLI | `az login` with read access to the `sptribs-aat` Key Vault. Development mode reads secrets from it |
| HMCTS VPN | Needed for AAT services (`*.service.core-compute-aat.internal`), AAT IDAM and Key Vault |
| Docker | Only for the Docker set-up, or to run the cftlib stack in `sptribs-case-api` |

## Run locally

```bash
corepack enable
yarn install
az login
yarn start:dev
```

`yarn start:dev` sets `NODE_ENV=development` and runs two `nodemon` processes, one for the Express server and one for the front-end assets (webpack). Open <http://localhost:3001>; the dev server is plain HTTP. Sign-in redirects to AAT IDAM.

Other start scripts:

| Script | Behaviour |
|---|---|
| `yarn start` | `NODE_ENV=production`, port 4000, secrets from a mounted volume. Used in deployed environments; run `yarn build` first |
| `yarn start:watch` | The same two `nodemon` processes, without setting `NODE_ENV` |
| `yarn start:debug` | Server only, with the `nodemon.express.json` settings |
| `yarn start:docker` | `NODE_ENV=docker`, using `config/docker.yaml` |

Sessions use a file store in `/tmp` unless `REDIS_HOST` is set, so Redis is not needed locally.

To turn off the global rate limiter while testing, start with `RATE_LIMITER_DISABLED=1 yarn start:dev`.

### Against the cftlib stack

`config/development.yaml` points the app at the ports used by the in-process CFT stack that [sptribs-case-api](https://github.com/hmcts/sptribs-case-api) starts with `./gradlew bootWithCCD`:

| Service | URL |
|---|---|
| `sptribs-case-api` | `http://localhost:4013` |
| CCD data store | `http://localhost:4452` |
| CDAM | `http://localhost:4455` |
| Update-case app | `http://localhost:3100` |

1. In a `sptribs-case-api` checkout, run `./gradlew bootWithCCD` and wait for the CCD definition import to finish. See that repository's README for its prerequisites.
2. In this repository, run `yarn start:dev`.
3. Open <http://localhost:3001> and sign in with a citizen account.

IDAM and S2S stay on AAT in this set-up, so you still need the VPN and `az login`.

### Against AAT

Override the three back-end URLs with the AAT hosts:

```bash
export SPTRIBS_CASE_API_URL=http://sptribs-case-api-aat.service.core-compute-aat.internal
export CCD_API_URL=http://ccd-data-store-api-aat.service.core-compute-aat.internal
export CASE_DOCUMENT_API_URL=http://ccd-case-document-am-api-aat.service.core-compute-aat.internal
yarn start:dev
```

To test against a `sptribs-case-api` pull request, use that pull request's preview hosts instead.

### With Docker

```bash
docker-compose build
docker-compose up
```

This builds the production image and exposes port 4000. The container runs in production mode, so it expects its secrets from a mounted volume and has none locally.

### Common problems

| Symptom | Fix |
|---|---|
| Start-up fails in `az keyvault secret show` | Run `az login` again, check `az account show`, and connect the VPN |
| `https://localhost:3001` does not load | The dev server is plain HTTP. Use `http://localhost:3001` |
| AAT hostnames do not resolve or time out | Connect the VPN |
| The session disappears | The `/tmp` file store was cleared, or the 21-minute session expired. Sign in again |

## Unit tests

```bash
yarn test            # Jest
yarn test:coverage   # with a coverage report
yarn lint            # tsc type check and ESLint
```

Jest (`jest.config.js`) runs `*.test.ts` files under `src/main` with `ts-jest` in a Node environment. The global coverage threshold is 80% for branches, functions, lines and statements. `@hmcts/nodejs-logging` is replaced by a mock in `src/test/unit/mocks`.

Unit tests sit next to the code they test, for example `src/main/steps/dashboard-telemetry.test.ts` or the `content.test.ts` file in each step directory.

`yarn cichecks` runs install, build, lint and unit tests together. The GitHub `checks.yml` workflow runs it on every pull request and on every push to `master`.

## Smoke tests

```bash
TEST_URL=https://sptribs-frontend.aat.platform.hmcts.net yarn test:smoke
```

`src/test/smoke/smoke.ts` (`jest.smoke.config.js`) checks:

- `/health` on the app (`TEST_URL`), CCD data store, IDAM web and API, the service auth provider, PCQ and the IDAM HMCTS access service, each expected to return 200 with status `UP`;
- that `/o/authorize` on the app redirects to `/login`.

Each test is retried up to 20 times. The service URLs come from config, so they follow the environment variables described in [Configuration](configuration.md).

`Jenkinsfile_CNP` runs the smoke tests against the preview deployment of every pull request and against AAT after a merge to `master`, and publishes `build/reports/tests/smoke/index.html`.

## Accessibility, functional and cross-browser tests

`yarn test:a11y`, `yarn test:functional`, `yarn test:fullfunctional`, `yarn test:crossbrowser` and `yarn test:crossbrowser-e2e` print `covered in nightly E2E` and exit. These tests live in a separate repository.

## End-to-end tests (hmcts/sptribs-e2etests)

The browser tests for this app are in [hmcts/sptribs-e2etests](https://github.com/hmcts/sptribs-e2etests), a Playwright suite that also covers the update-case app and the caseworker journeys in Manage Case.

### What covers this app

| Test file | Tags | Covers |
|---|---|---|
| `src/tests/E2E/createCaseFE.test.ts` | `@DSSCreate`, `@createDSSFirefox`, `@createDSSWebkit`, `@accessibility` | The new application journey, from sign-in to submission, including uploads and Welsh content |
| `src/tests/E2E/citizenDashboard.test.ts` | `@CaseAPI`, `@CaseAPI1`, `@accessibility` | The CICA lookup, postcode verification and document dashboard |

Tests tagged `@accessibility` run the same journeys with an axe audit on each page, and any violation fails the test.

### Running them

From a checkout of `sptribs-e2etests`:

```bash
yarn install
yarn configure        # playwright install --with-deps
yarn load-secrets     # writes .env from the sptribs-aat Key Vault (az login and VPN)
export DSS_BASE_URL=https://sptribs-frontend.aat.platform.hmcts.net
export UC_BASE_URL=https://sptribs-dss-update-case-web.aat.platform.hmcts.net
export CASEAPI_BASE_URL=https://manage-case.aat.platform.hmcts.net
yarn test:ChromeDSS   # or test:FirefoxDSS, test:WebkitDSS
```

`DSS_BASE_URL` is the address of this app. To test a pull request, set it to the preview URL (`https://sptribs-frontend-pr-<number>.preview.platform.hmcts.net`). The DSS tests check the new case in Manage Case afterwards, so they need a `sptribs-case-api` that matches the change under test.

`yarn test:report` opens the HTML report.

### In the pipelines

- The `sptribs-e2etests` nightly pipeline runs on weekday mornings against AAT. It runs the DSS create tests on Chrome, Firefox and WebKit, the update-case tests, the caseworker tests (including the citizen dashboard test) and the accessibility tests. This is the main browser regression run for this app.
- This repository's `Jenkinsfile_CNP` does not run the end-to-end suite. Run it by hand against your preview deployment when a change affects the journey.
