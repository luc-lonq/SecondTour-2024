#!/bin/bash

while getopts "i" flag; do
    case "${flag}" in
        i)
          docker -v
          if [ $? -eq 127 ]; then
            for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

            sudo apt-get -y update
            sudo apt-get -y install ca-certificates curl
            sudo install -m 0755 -d /etc/apt/keyrings
            sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
            sudo chmod a+r /etc/apt/keyrings/docker.asc

            echo \
              "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
              $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
              sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt-get -y update
            sudo apt-get -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
          fi;;
    esac
done

cd stack
mkdir -p api/secondtour_api_v2/logs
mkdir -p website/secondtour_website/website/logs

sudo docker compose up --build -d
sleep 5

url="http://localhost:44300/utility/createtables"
content_type_header="Content-Type: application/json"
accept_header="accept: application/json"
response=$(sudo curl -s --request GET \
  --url "$url" \
  --header "$content_type_header" \
  --header "$accept_header")
echo $response

url="http://localhost:44300/utility/init"
content_type_header="Content-Type: application/json"
accept_header="accept: application/json"
response=$(sudo curl -s --request GET \
  --url "$url" \
  --header "$content_type_header" \
  --header "$accept_header")
echo $response
