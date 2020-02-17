FROM node:11-alpine

COPY ./ /root/explorer-hydra
RUN rm -rf /root/explorer-hydra/node_modules

RUN apk add --update git python make g++

RUN cd ~/explorer-hydra && yarn install && yarn build:devnet

COPY docker/docker-entrypoint.sh /usr/local/bin/
RUN ln -s usr/local/bin/docker-entrypoint.sh / # backwards compat

EXPOSE 4200:4200

ENTRYPOINT ["docker-entrypoint.sh"]
