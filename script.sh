#!/bin/bash
cd stack/api/secondtour_api_v2
apt-get update
apt-get install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install
npm i
cd ../..
docker compose up --build