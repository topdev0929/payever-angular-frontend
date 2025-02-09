FROM node:10.13 as builder

COPY . /payever
RUN echo 'machine gitlab.devpayever.com login deploybot password tVUeMCwr3SUWod4UGxDD' > ~/.netrc
RUN apt-get update && apt-get install -y curl git bzip2 openssh-client --no-install-recommends
RUN cd /payever/ && npm install
RUN cd /payever/ && npm run build:invoice


FROM registry.devpayever.com/nginx:master
COPY --from=builder /payever/dist /usr/share/nginx/html
