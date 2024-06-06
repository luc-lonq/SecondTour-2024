FROM node:20-alpine

WORKDIR /app

COPY api/secondtour_api_v2/package.json ./

RUN npm install

WORKDIR /app/api/secondtour_api_v2

# CMD ["ls"] 
CMD ["npm", "run", "start"]
