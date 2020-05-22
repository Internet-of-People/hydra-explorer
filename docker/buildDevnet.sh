#!/bin/sh

rm -rf dist

yarn
yarn build:devnet

sudo docker build -f docker/DockerFile -t internetofpeople/hydra-explorer:latest-devnet .