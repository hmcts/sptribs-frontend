# sptribs-frontend

Citizen web application for the First-tier Tribunal (Special Tribunals), Criminal Injuries Compensation (CIC) jurisdiction.

It is used by appellants and their representatives to:

- start and submit a new CIC appeal (the DSS application journey);
- find an existing case by its CCD reference, confirm the postcode held on it, and view and download the case documents on a dashboard.

Caseworkers and judges do not use this app. They work on the same cases in Manage Case (ExUI).

The app holds no case logic of its own. It is a Node.js/Express application rendered with Nunjucks and GOV.UK Frontend. Case data is written to CCD as citizen events, and CCD sends the callbacks to [sptribs-case-api](https://github.com/hmcts/sptribs-case-api), which owns the case type `CriminalInjuriesCompensation` in jurisdiction `ST_CIC`. Documents are stored through CCD Case Document Access Management (CDAM).

The companion app [sptribs-dss-update-case-web](https://github.com/hmcts/sptribs-dss-update-case-web) lets a citizen add documents to a case that already exists.

## Journey overview

1. The citizen opens the landing page (`/`) and signs in through IDAM (`/login`, then `/receiver`).
2. After sign-in they land on `/cica-lookup`. They either enter a CCD case reference or choose to start a new application.
3. **Existing case**: the app checks access with `sptribs-case-api`, asks for the postcode (`/cica-postcode-verification`) and shows the documents on `/dashboard`.
4. **New application**: the citizen works through the application pages, from `/subject-details` to `/check-your-answers`. The case is created in CCD when the subject's contact details are first saved, updated on later pages and submitted from check your answers.

The full step list, the API calls and the session handling are in [docs/journey.md](docs/journey.md).

## Quick start

Prerequisites: Node.js 22 (the version in the `Dockerfile`; `package.json` accepts 18.16 or later), Yarn 4 through Corepack, the Azure CLI signed in with read access to the `sptribs-aat` Key Vault, and the HMCTS VPN for AAT services.

```bash
corepack enable
yarn install
az login
yarn start:dev
```

Open <http://localhost:3001>. In development mode the app:

- listens on port 3001 over plain HTTP (`config/development.yaml`);
- reads its secrets from the `sptribs-aat` Key Vault with `az`;
- signs users in through AAT IDAM;
- calls a local `sptribs-case-api` on port 4013, CCD data store on 4452 and CDAM on 4455, which is the layout of the cftlib stack that `sptribs-case-api` starts with `./gradlew bootWithCCD`.

To run against AAT instead, or with Docker, see [docs/running-and-testing.md](docs/running-and-testing.md).

## Configuration summary

Configuration uses [node-config](https://github.com/node-config/node-config): `config/default.yaml`, then `config/<NODE_ENV>.yaml`, then the environment variables mapped in `config/custom-environment-variables.yaml`.

| Setting | Environment variable | Notes |
|---|---|---|
| Case API | `SPTRIBS_CASE_API_URL` | `sptribs-case-api`: case access check, dashboard documents and downloads |
| CCD data store | `CCD_API_URL` | Case creation and citizen events |
| CDAM | `CASE_DOCUMENT_API_URL` | Document upload and delete |
| IDAM | `IDAM_WEB_URL`, `IDAM_API_URL`, `IDAM_END_SESSION_URL`, `IDAM_SECRET` | OpenID Connect sign-in |
| S2S | `SERVICE_AUTH_PROVIDER_URL`, `SERVICE_AUTH_SECRET` | Service token lease; the app leases its token as `sptribs_case_api` |
| Sessions | `REDIS_HOST`, `REDIS_PORT` | Redis when a host is set, otherwise a file store in `/tmp` |
| Rate limiter | `RATE_LIMITER_DISABLED` | Any value turns off the global limit of 30 requests per 15 seconds |

In deployed environments secrets come from the `sptribs-<env>` Key Vault, mounted by the Helm chart and copied into config by `src/main/modules/properties-volume/index.ts`. The full list of keys, secrets and environments is in [docs/configuration.md](docs/configuration.md).

## Tests

| Command | What it runs |
|---|---|
| `yarn test` | Jest unit tests (`*.test.ts` under `src/main`), with an 80% coverage threshold |
| `yarn test:coverage` | Unit tests with a coverage report |
| `yarn lint` | TypeScript type check and ESLint |
| `yarn test:smoke` | Health checks of the deployed app and its dependencies, and a sign-in redirect check. Needs `TEST_URL` |
| `yarn test:a11y`, `yarn test:functional`, `yarn test:crossbrowser` | Print a message and exit. Browser, accessibility and cross-browser tests are in [hmcts/sptribs-e2etests](https://github.com/hmcts/sptribs-e2etests) |
| `yarn cichecks` | Install, build, lint and unit test, as run by the GitHub `checks.yml` workflow |

See [docs/running-and-testing.md](docs/running-and-testing.md) for how the end-to-end suite covers this app.

## Developing

### Code style

The project uses [ESLint](https://github.com/typescript-eslint/typescript-eslint) with Prettier. To lint and fix:

```bash
yarn lint --fix
```

To install the Git hooks that run checks before each commit:

```bash
yarn prepare
```

### Testing against a sptribs-case-api pull request

A `sptribs-case-api` pull request deploys its own preview environment, including a CCD stack. To point this app at it, set `SPTRIBS_CASE_API_URL` and `CCD_API_URL` to the preview hosts (for example `http://sptribs-case-api-pr-<number>.preview.platform.hmcts.net`), either locally or in `charts/sptribs-frontend/values.preview.template.yaml` on your own pull request.

Add the `enable_keep_helm` label to a pull request to keep its preview release after the pipeline finishes. With cluster access you can then find its URL with:

```bash
kubectl -n sptribs get ingress | grep <pr-number>
```

### Security

#### CSRF prevention

[Cross-Site Request Forgery](https://github.com/pillarjs/understanding-csrf) protection is enabled for the whole application (`src/main/modules/csrf`). Every HTML form that posts back must include the token, using the `csrfProtection` macro:

```njk
{% from "macros/csrf.njk" import csrfProtection %}
...
<form ...>
  ...
    {{ csrfProtection(csrfToken) }}
  ...
</form>
```

#### Helmet

The app uses [Helmet](https://helmetjs.github.io/) to set security-related HTTP headers, including `Referrer-Policy` and `Content-Security-Policy`. The referrer policy is set by `security.referrerPolicy` in `config/default.yaml`.

### Health check

The app exposes `/health`, `/health/liveness` and `/health/readiness` through [nodejs-healthcheck](https://github.com/hmcts/nodejs-healthcheck). `/health` checks Redis (when configured), the S2S service, IDAM, the IDAM HMCTS access service and CCD data store. The Kubernetes probes use the liveness and readiness endpoints.

## Documentation

- [docs/journey.md](docs/journey.md): steps, routing, CCD and case API calls, sessions, Welsh and uploads
- [docs/configuration.md](docs/configuration.md): config keys, secrets, the Helm chart and environments
- [docs/running-and-testing.md](docs/running-and-testing.md): running locally, unit and smoke tests, and the end-to-end suite

Related repositories:

- [hmcts/sptribs-case-api](https://github.com/hmcts/sptribs-case-api): case type definition, callbacks and the `/cases/cica/...` endpoints
- [hmcts/sptribs-dss-update-case-web](https://github.com/hmcts/sptribs-dss-update-case-web): adding documents to an existing case
- [hmcts/sptribs-e2etests](https://github.com/hmcts/sptribs-e2etests): Playwright end-to-end tests

## Licence

This project is licensed under the MIT Licence. See the [LICENSE](LICENSE) file for details.
