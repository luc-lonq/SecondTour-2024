ARG VERSION

# Dev image
FROM ubuntu

# Update & install nginx & python
RUN apt-get update && apt-get install -y nginx \
    nano \
    python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools python3-venv \
    && rm /etc/nginx/sites-enabled/default

RUN mkdir -p /app/website/secondtour_website

COPY ./website/secondtour_website/requirements.txt /app/website/secondtour_website/requirements.txt
COPY ./build/website/start.sh /app/scripts/start.sh

RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install -r /app/website/secondtour_website/requirements.txt

# Installer uwsgi dans l'environnement virtuel
RUN /app/venv/bin/pip install uwsgi

# Copy nginx config
COPY ./build/website/uwsgi.conf /etc/nginx/uwsgi_params
COPY ./build/website/default.conf /etc/nginx/sites-enabled/secondtour_website

# Rendre le script start.sh exécutable
RUN chmod +x /app/scripts/start.sh

# Expose port 80
EXPOSE 80

# Set CMD to start.sh
CMD ["bash", "/app/scripts/start.sh"]