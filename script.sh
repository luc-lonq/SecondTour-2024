#!/bin/bash
cd stack/api/secondtour_api_v2
apt-get update
apt-get install curl
curl -sL https://deb.nodesource.com/setup_4.x | bash
apt-get install nodejs
npm i
cd ../..
docker compose up --build