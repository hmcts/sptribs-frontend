# Configuration

## How configuration is loaded

The app uses [node-config](https://github.com/node-config/node-config). Values are resolved in this order, each layer overriding the one before:

1. `config/default.yaml`
2. `config/<NODE_ENV>.yaml` (`development.yaml`, `production.yaml`, `docker.yaml` or `test.yaml`)
3. Environment variables listed in `config/custom-environment-variables.yaml`
4. Secrets copied in by `src/main/modules/properties-volume/index.ts` (see [Secrets](#secrets))

`yarn start` sets `NODE_ENV=production`. `yarn start:dev` sets `NODE_ENV=development`. Any `NODE_ENV` other than `production` puts the app in development mode (`app.locals.developmentMode`), which changes how secrets are loaded, turns off the `secure` cookie flag and builds the IDAM callback URL with `http://` and the configured port.

## Environment variables and config keys

| Environment variable | Config key | Default (`default.yaml`) | Purpose |
|---|---|---|---|
| `PORT` | `port` | `4000` (`3001` in `development.yaml`) | HTTP port |
| `SPTRIBS_CASE_API_URL` | `services.sptribs.url` | AAT `sptribs-case-api` | Case access check, dashboard documents and downloads |
| `CCD_API_URL` | `services.ccd.url` | AAT `ccd-data-store-api` | Event triggers, case creation and citizen events |
| `CASE_DOCUMENT_API_URL` | `services.cdam.url` | AAT `ccd-case-document-am-api` | Document upload and delete |
| `SERVICE_AUTH_PROVIDER_URL` | `services.authProvider.url` | AAT `rpe-service-auth-provider` | S2S lease endpoint |
| `SERVICE_AUTH_SECRET` | `services.authProvider.secret` | placeholder | S2S TOTP secret |
| none | `services.authProvider.microservice` | `sptribs_case_api` | Microservice name the S2S token is leased as |
| `IDAM_WEB_URL` | `services.idam.authorizationURL` | AAT IDAM `/o/authorize` | OIDC authorisation endpoint |
| `IDAM_API_URL` | `services.idam.tokenURL` | AAT IDAM `/o/token` | OIDC token endpoint |
| `IDAM_END_SESSION_URL` | `services.idam.endSessionURL` | AAT IDAM `/o/endSession` | Sign-out |
| `IDAM_CLIENT_ID` | `services.idam.clientID` | set in `default.yaml` | OAuth2 client ID |
| `IDAM_SECRET` | `services.idam.clientSecret` | placeholder | OAuth2 client secret |
| `IDAM_HMCTS_URL` | `services.idam.hmctsToken` | AAT `hmcts-access` | IDAM HMCTS access service, used by the health check |
| `EQUALITY_URL` | `services.equalityAndDiversity.url` | AAT PCQ | Protected Characteristics Questionnaire |
| `PCQ_TOKEN` | `services.equalityAndDiversity.tokenKey` | placeholder | Key used to sign the PCQ hand-off parameters |
| `PCQ_ENABLED` | `services.equalityAndDiversity.enabled` | `true` | Turns the PCQ hand-off on or off |
| `DSS_UPDATE_URL` | `services.dssUpdate.url` | AAT `sptribs-dss-update-case-web` | Link to the update-case app |
| none | `services.postcodeLookup.url`, `.token` | Ordnance Survey Places API, placeholder | Address lookup |
| `REDIS_HOST`, `REDIS_PORT` | `session.redis.host`, `.port` | empty, `10000` | Session store. With no host, sessions use a file store in `/tmp` |
| `APPINSIGHTS_KEY` | `appInsights.instrumentationKey` | empty | Application Insights |
| `CASE_TYPE`, `JURISDICTION` | `caseType`, `jurisdiction` | `CriminalInjuriesCompensation`, `ST_CIC` | Case type for CCD and CDAM calls |
| `UPLOAD_TIMEOUT` | `uploadTimeout` | `60000` | Upload request timeout in milliseconds |
| `TEST_PASSWORD` | `e2e.userTestPassword` | empty | Test use only |
| `RATE_LIMITER_DISABLED` | read from `process.env` in `src/main/server.ts` | unset | Any value turns off the global rate limit of 30 requests per 15 seconds per client |

Other keys in `default.yaml` without an environment variable:

| Config key | Default | Purpose |
|---|---|---|
| `documentUpload.validation.totaldocuments` | `5` | Maximum appeal form documents |
| `documentUpload.validation.totalSupportingDocuments` | `5` | Maximum supporting documents |
| `documentUpload.validation.totalAdditionalDocuments` | `20` | Maximum additional documents |
| `documentUpload.validation.totalOtherInformation` | `20` | Maximum other information documents |
| `documentUpload.validation.sizeInBytes` | `104857600` | Maximum file size (100 MB) |
| `queryParamsforApp.query` | `CIC: 'CIC'` | Accepted values of the landing page `edgecaseType` parameter |
| `security.referrerPolicy` | `origin` | `Referrer-Policy` header set by Helmet |
| `health.timeout`, `health.deadline` | `5000`, `15000` | Health check timeouts in milliseconds |
| `cookies.expiryTime` | `365` | Cookie preferences lifetime in days |
| `dynatrace.dynatraceUrl` | Dynatrace script URL | Real user monitoring script |

There is no feature-flag service. Behaviour is controlled by the keys above.

## Secrets

### Deployed environments

The Helm chart lists the secrets to mount from the `sptribs-<env>` Azure Key Vault under `nodejs.keyVaults.sptribs.secrets`. The pod reads them through [@hmcts/properties-volume](https://github.com/hmcts/properties-volume-nodejs), which exposes each one as `secrets.sptribs.<name>`. `PropertiesVolume.enableFor()` then copies each secret into the config key the code reads. No environment variable is involved.

| Key Vault secret | Config key |
|---|---|
| `idam-ui-secret` | `services.idam.clientSecret` |
| `idam-systemupdate-username`, `idam-systemupdate-password` | `services.idam.systemUsername`, `services.idam.systemPassword` |
| `redis-new` (mounted with the alias `redis-access-key`) | `session.redis.key` and `session.secret` |
| `s2s-case-api-secret` | `services.authProvider.secret` |
| `app-insights-connection-string` (`app-insights-connection-string-preview` in preview, aliased) | `appInsights.instrumentationKey` |
| `postcode-lookup-token` | `services.postcodeLookup.token` |
| `specialTribunals-cic-pcq-token` | `services.equalityAndDiversity.tokenKey` |
| `sptribs-frontend-dynatrace-url` | `dynatrace.dynatraceUrl` |

To add a secret:

1. Create it in the `sptribs-<env>` Key Vault for every environment.
2. Add it to `nodejs.keyVaults.sptribs.secrets` in `charts/sptribs-frontend/values.yaml`, and in `values.preview.template.yaml` if preview needs it.
3. Add a `setSecret('secrets.sptribs.<name>', '<config.key>')` line to `src/main/modules/properties-volume/index.ts`.
4. For local development, add a `setLocalSecret()` line as well.

### Development mode

In development mode `PropertiesVolume` does not read a mounted volume. It runs `az keyvault secret show --vault-name sptribs-aat` for `idam-ui-secret`, `s2s-case-api-secret`, `postcode-lookup-token` and `specialTribunals-cic-pcq-token`, and writes the values into the same config keys. You need `az login` with read access to that vault and, for AAT, the VPN. These values replace anything set through `IDAM_SECRET`, `SERVICE_AUTH_SECRET` or `PCQ_TOKEN`.

### Pipeline secrets

`Jenkinsfile_CNP` loads a separate set of secrets from `sptribs-${env}` for the pipeline's own test stages. They do not reach the running pod.

| Key Vault secret | Pipeline variable |
|---|---|
| `idam-ui-secret` | `IDAM_SECRET` |
| `citizen-user`, `citizen-password` | `CITIZEN_USERNAME`, `CITIZEN_PASSWORD` |
| `specialTribunals-cic-pcq-token` | `PCQ_TOKEN` |
| `s2s-secret-sptribs-frontend` | `SERVICE_AUTH_SECRET` |

## Helm chart

The chart is `charts/sptribs-frontend`, a wrapper around the HMCTS `nodejs` chart (version 3.x, from `oci://hmctsprod.azurecr.io/helm`).

| File | Role |
|---|---|
| `values.yaml` | Base values: port 4000, AAD identity `sptribs`, ingress `sptribs-frontend.{{ .Values.global.environment }}.platform.hmcts.net`, image `hmctsprod.azurecr.io/sptribs/frontend`, spot instances off. Sets the service URLs for the environment (`SPTRIBS_CASE_API_URL`, `CCD_API_URL`, `CASE_DOCUMENT_API_URL`, IDAM, S2S, PCQ, `DSS_UPDATE_URL`), `REDIS_HOST` and `REDIS_PORT`, and lists the Key Vault secrets |
| `values.preview.template.yaml` | Pull request deployments: `RATE_LIMITER_DISABLED: true`, the AAT Redis host and the preview Application Insights secret |
| `values.aat.template.yaml` | AAT pipeline stage: sets only the image and ingress host |

The deployed releases in AAT, demo, perftest, ithc and prod are managed by Flux in [hmcts/cnp-flux-config](https://github.com/hmcts/cnp-flux-config) under `apps/sptribs/sptribs-frontend/`, which also holds the per-environment overrides, such as the production ingress host, the production IDAM URLs and the PCQ settings.

## Environments

| Environment | URL | Deployed by |
|---|---|---|
| Preview | `https://sptribs-frontend-pr-<number>.preview.platform.hmcts.net` | Jenkins, for each pull request |
| AAT | `https://sptribs-frontend.aat.platform.hmcts.net` | Jenkins on merge to `master`, then Flux |
| Demo | `https://sptribs-frontend.demo.platform.hmcts.net` | Flux |
| Perftest | `https://sptribs-frontend.perftest.platform.hmcts.net` | Flux |
| ITHC | `https://sptribs-frontend.ithc.platform.hmcts.net` | Flux |
| Production | `https://special-tribunals.service.gov.uk` | Flux |

All environments run in the `sptribs` Kubernetes namespace.

### Release flow

1. A pull request runs `Jenkinsfile_CNP`: build, lint and unit tests, a Docker image, a preview deployment and the smoke tests against it. The GitHub `checks.yml` workflow runs `yarn cichecks` in parallel.
2. A merge to `master` builds again, deploys to AAT, runs the smoke tests against AAT and publishes an image tagged `prod-<sha>-<timestamp>`.
3. Flux image automation in `cnp-flux-config` picks up the new `prod-` tag and rolls it out to production and the other environments.
4. The pipeline also pushes `master` to the `demo`, `perftest` and `ithc` branches (`syncBranchesWithMaster`).

`Jenkinsfile_nightly` runs on weekday mornings and performs a dependency check and a Fortify scan. The browser tests for this app run in the [hmcts/sptribs-e2etests](https://github.com/hmcts/sptribs-e2etests) nightly pipeline (see [Running and testing](running-and-testing.md)).

### Monitoring

- Application Insights receives requests, dependency calls, exceptions and the dashboard telemetry events described in [Journey](journey.md#finding-an-existing-case).
- Pod logs: `kubectl logs -n sptribs deploy/sptribs-frontend-nodejs`.
- `/health` reports the state of Redis, S2S, IDAM and CCD data store. The Kubernetes probes use `/health/liveness` and `/health/readiness`.
