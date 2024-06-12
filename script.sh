#!/bin/bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
mkdir -p stack/api/secondtour_api_v2/logs
mkdir -p stack/website/secondtour_website/website/logs
cd stack
docker compose up --build

while getopts i:d: flag
do
    case "${flag}" in
        i)
          url="http://localhost:44300/utility/createtables"
          content_type_header="Content-Type: application/json"
          accept_header="accept: application/json"
          curl -s --request GET \
            --url "$url" \
            --header "$content_type_header" \
            --header "$accept_header"
          url="http://localhost:44300/utility/init"
          content_type_header="Content-Type: application/json"
          accept_header="accept: application/json"
          curl -s --request GET \
            --url "$url" \
            --header "$content_type_header" \
            --header "$accept_header"
        d) age=${OPTARG};;
    esac
done

sleep 10

url="http://localhost:44300/utility/createtables"

content_type_header="Content-Type: application/json"
accept_header="accept: application/json"

curl -s --request GET \
  --url "$url" \
  --header "$content_type_header" \
  --header "$accept_header"

url="http://localhost:44300/utility/init"

content_type_header="Content-Type: application/json"
accept_header="accept: application/json"

curl -s --request GET \
  --url "$url" \
  --header "$content_type_header" \
  --header "$accept_header"
