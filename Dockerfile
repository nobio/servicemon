FROM node:16
WORKDIR /opt/servicemon

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
# copy source code to /usr/src/app folder
COPY src /opt/servicemon/src

RUN npm ci
RUN npm run build --production
RUN rm -rf ./src

# create database files (lokijs) and fix access rights
RUN touch monitor.db monitor.db.0
RUN chmod g+rw monitor.db*

EXPOSE 28090 28090

CMD [ "npm", "start" ]