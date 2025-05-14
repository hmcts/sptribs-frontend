# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node:22-alpine as base
USER root
RUN corepack enable
COPY --chown=hmcts:hmcts . .
USER hmcts
RUN yarn workspaces focus --production

# ---- Build image ----
FROM base as build
RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true yarn install && yarn build:prod

# ---- Runtime image ----
FROM base as runtime
RUN rm -rf webpack/ webpack.config.js
COPY --from=build $WORKDIR/src/main ./src/main

EXPOSE 4000
