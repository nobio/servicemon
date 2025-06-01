FROM node:lts-alpine3.22 AS base-image
WORKDIR /opt/servicemon

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
# copy source code to /usr/src/app folder
COPY src /opt/servicemon/src
COPY keys /opt/servicemon/keys

RUN npm ci
RUN npm run build:docker --production
RUN rm -rf ./src

# create database files (lokijs) and fix access rights
RUN touch monitor.db monitor.db.0
RUN chmod g+rw monitor.db*

EXPOSE 28090 28090
EXPOSE 28093 28093

CMD [ "npm", "run", "start:docker" ]