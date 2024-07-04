FROM node:14

WORKDIR /app

COPY api/secondtour_api_v2/package*.json ./

RUN npm install

COPY api/secondtour_api_v2 /app/api/secondtour_api_v2

WORKDIR /app/api/secondtour_api_v2

CMD ["npm", "run", "start"]
