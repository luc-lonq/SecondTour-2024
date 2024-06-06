ARG VERSION

# Dev image
FROM ubuntu




# Update & install nginx & python
# RUN apt-get update && apt-get -y upgrade && apt-get autoremove
# RUN apt-get install --fix-brokeny
# RUN apt-get install -y nginx
# RUN apt-get install nano
# RUN dpkg --configure -a
# RUN apt install -y python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools
# RUN rm /etc/nginx/sites-enabled/default

RUN apt-get update
RUN apt-get install -y nginx
RUN apt-get install nano
RUN apt-get install -y python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools python3-venv
RUN rm /etc/nginx/sites-enabled/default

RUN mkdir -p /app/website/secondtour_website 

COPY ./website/secondtour_website/requirements.txt /app/website/secondtour_website/requirements.txt
COPY ./build/website/start.sh /app/scripts/start.sh

RUN mkdir /venv
RUN python3 -m venv /venv
RUN source /venv/bin/activate
RUN pip install -r /app/website/secondtour_website/requirements.txt

# Copy nginx config
COPY ./build/website/uwsgi.conf /etc/nginx/uwsgi_params
COPY ./build/website/default.conf /etc/nginx/sites-enabled/secondtour_website


# CMD ["nginx", "-g", "daemon", "off;"]
# CMD ["uwsgi", "/app/website/secondtour_website/website.ini"]
CMD ["bash", "/app/scripts/start.sh"]

EXPOSE 80


