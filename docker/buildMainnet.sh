#!/bin/sh

rm -rf dist

yarn
yarn build:mainnet

sudo docker build -f docker/DockerFile -t internetofpeople/hydra-explorer:latest-mainnet .