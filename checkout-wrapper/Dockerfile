ARG BUILD_NODE_IMAGE
ARG PROD_NGINX_IMAGE

FROM $BUILD_NODE_IMAGE AS build

ARG NAMESPACE
ENV NAMESPACE=$NAMESPACE
RUN echo "==>$NAMESPACE"

WORKDIR /payever

RUN mkdir -p /payever/apps/environments
COPY package.json package-lock.json .npmrc ./apps/environments/env.production.ts /payever/
# RUN cd /payever && npm ci --cache .npm --prefer-offline
RUN npm ci --legacy-peer-deps
#  --cache .npm --prefer-offline --no-audit --progress=false
COPY . .
COPY ./apps/environments/env.$NAMESPACE.ts /payever/apps/environments/environment.ts

# RUN cd /payever

RUN npm run build --verbose
RUN ls -la /payever/
RUN ls -la /payever/dist/
RUN rm -rf /cdn/wrapper/* && \
    mkdir -p /cdn/wrapper && \
    cp -R dist/* /cdn/wrapper

FROM $PROD_NGINX_IMAGE

ARG CI_COMMIT_SHA

COPY --from=build /payever/dist /payever
COPY --from=build /payever/env.production.ts /payever/environment.prod.ts
COPY --from=build /payever/apps/environments/environment.ts /payever/
COPY --from=build /payever/env.* /payever/
COPY --from=build /cdn/wrapper /cdn/wrapper

COPY ./deploy /payever/deploy
RUN chmod 755 /payever/deploy -R

RUN mkdir /payever/api && echo $CI_COMMIT_SHA && echo $CI_COMMIT_SHA > /payever/api/status
