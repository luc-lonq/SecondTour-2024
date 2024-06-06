#!/bin/bash
cd stack/api/secondtour_api_v2
apt-get update
apt-get install curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - sudo apt install -y nodejsnvm install
npm i
cd ../..
docker compose up --build