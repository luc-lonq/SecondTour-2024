#!/bin/bash
cd stack/api/secondtour_api_v2
apt install -y nodejs
npm i
cd ../..
docker compose up --build