FROM node:25-alpine AS base-image
WORKDIR /opt/servicemon

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
# copy source code to /usr/src/app folder
COPY src /opt/servicemon/src
COPY keys /opt/servicemon/keys

# create database files (lokijs) and fix access rights
RUN touch monitor.db monitor.db.0
RUN chmod g+rw monitor.db*

RUN npm ci

EXPOSE 28090 28090
EXPOSE 28093 28093

CMD [ "npm", "run", "start:log-info" ]