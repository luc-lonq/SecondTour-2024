#!/bin/bash

# Démarrer nginx
service nginx start

mkdir -p /app/website/secondtour_website/logs
touch /app/website/secondtour_website/logs/logs_info.txt

# Activer l'environnement virtuel
source /app/venv/bin/activate


# Démarrer uwsgi
cd /app/website/secondtour_website

/app/venv/bin/uwsgi website.ini