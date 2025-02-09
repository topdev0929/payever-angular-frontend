ARG BUILD_NODE_IMAGE
ARG PROD_NGINX_IMAGE

FROM $BUILD_NODE_IMAGE AS build

ENV BUILD_NODE_IMAGE=$BUILD_NODE_IMAGE
ENV PROD_NGINX_IMAGE=$PROD_NGINX_IMAGE

RUN echo "BUILD_NODE_IMAGE=$BUILD_NODE_IMAGE"
RUN echo "PROD_NGINX_IMAGE=$PROD_NGINX_IMAGE"

WORKDIR /payever

ARG NAMESPACE
ENV NAMESPACE=$NAMESPACE
RUN echo "npm version=> $(npm --version)"
RUN npm config set cache /.npm-cache
RUN echo "Path to npm cache2=> $(npm get cache)"

COPY ./package.json ./package-lock.json .npmrc ./apps/commerceos/src/environments/environment.prod.ts ./decorate-angular-cli.js /payever/
COPY ./apps/commerceos/src/environments/env.$NAMESPACE.ts /payever/env.$NAMESPACE
RUN cd /payever && npm ci --legacy-peer-deps --verbose || FAILED=true; if [ $FAILED ]; then rm -rf node_modules; rm -rf package-lock.json; npm cache clean --force && npm i --legacy-peer-deps && npm ci --legacy-peer-deps; fi
COPY ./ /payever

RUN sed -i "s/microenvironment/$NAMESPACE/g" /payever/apps/commerceos/src/environments/environment.prod.ts
# TODO: Is this npm i really necessary here?
# TODO: how speed up build?
# RUN cd /payever && npm i && export NODE_OPTIONS=--max_old_space_size=4096 && npm run build
RUN cd /payever && export NODE_OPTIONS="--max_old_space_size=8192 --openssl-legacy-provider" && npm run build

FROM $PROD_NGINX_IMAGE

ARG CI_COMMIT_SHA
ENV CI_COMMIT_SHA=$CI_COMMIT_SHA
COPY --from=build /payever/dist /payever
COPY --from=build /payever/apps/commerceos/src/environments/environment.prod.ts /payever
COPY --from=build /payever/env.* /payever
RUN apk update
RUN apk add perl parallel sed
COPY ./deploy /payever/deploy
RUN chmod 755 /payever/deploy -R
RUN cat /payever/environment.prod.ts
RUN mkdir /payever/api && echo $CI_COMMIT_SHA && echo $CI_COMMIT_SHA > /payever/api/status


RUN curl -L -o azcopy.tar.gz \
    https://azcopyvnext.azureedge.net/release20211027/azcopy_linux_amd64_10.13.0.tar.gz \
    && tar -xf azcopy.tar.gz --strip-components=1 \
    && rm -f azcopy.tar.gz \
    && cp azcopy /usr/local/bin \
    && cp azcopy /usr/bin
