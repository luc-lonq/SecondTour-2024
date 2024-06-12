# Utiliser une image officielle de Node.js comme image de base
FROM node:14

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier package.json et package-lock.json (si présent) dans le répertoire de travail
COPY api/secondtour_api_v2/package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier le reste des fichiers du projet dans le conteneur
COPY api/secondtour_api_v2 /app/api/secondtour_api_v2

# Définir le répertoire de travail final pour votre application
WORKDIR /app/api/secondtour_api_v2

CMD ["npm", "run", "start"]
