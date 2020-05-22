#!/bin/sh

rm -rf dist

yarn
yarn build:testnet

sudo docker build -f docker/DockerFile -t internetofpeople/hydra-explorer:latest-testnet .