#!/bin/sh

echo "Running explorer..."
EXPLORER_HOST="0.0.0.0" EXPLORER_PORT="4200" DEBUG=express:* node /root/explorer-hydra/express-server.js
