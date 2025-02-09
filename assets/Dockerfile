ARG BUILD_NODE_IMAGE="payeverk8sregistry.azurecr.io/build/node16:1.0.0"
ARG PROD_NGINX_IMAGE="payeverk8sregistry.azurecr.io/prod/nginx:1.0.3"

FROM $BUILD_NODE_IMAGE AS build

ENV BUILD_NODE_IMAGE=$BUILD_NODE_IMAGE
ENV PROD_NGINX_IMAGE=$PROD_NGINX_IMAGE

RUN echo "BUILD_NODE_IMAGE=$BUILD_NODE_IMAGE"
RUN echo "PROD_NGINX_IMAGE=$PROD_NGINX_IMAGE"

WORKDIR /payever

ARG NAMESPACE
ENV NAMESPACE=$NAMESPACE

COPY ./package.json /payever

RUN npm i

COPY ./scripts/ /payever/scripts
COPY ./index.html/ /payever/index.html
COPY ./apps/ /payever/apps
COPY ./css/ /payever/css/
COPY ./assets/ /payever/assets/
COPY ./tsconfig.json /payever
COPY ./webpack.config.js /payever

RUN npm run build

FROM $PROD_NGINX_IMAGE

ARG CI_COMMIT_SHA
ENV CI_COMMIT_SHA=$CI_COMMIT_SHA
COPY --from=build /payever /payever
COPY --from=build /payever/dist/demo.js /payever

RUN apk update
# RUN apk add perl parallel sed
COPY ./deploy /payever/deploy
RUN chmod 755 /payever/deploy -R

RUN curl -L -o azcopy.tar.gz \
    https://azcopyvnext.azureedge.net/release20211027/azcopy_linux_amd64_10.13.0.tar.gz \
    && tar -xf azcopy.tar.gz --strip-components=1 \
    && rm -f azcopy.tar.gz \
    && cp azcopy /usr/local/bin \
    && cp azcopy /usr/bin
