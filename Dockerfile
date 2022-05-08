#FROM node:16
FROM arm64v7/node:latest
WORKDIR /opt/servicemon

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
# copy source code to /usr/src/app folder
COPY src /opt/servicemon/src

#RUN apt-get update -y
#RUN apt-get install -y python
RUN npm install
RUN npm run build --production

# create database files (lokijs) and fix access rights
RUN touch monitor.db monitor.db.0
RUN chmod g+rw monitor.db*

EXPOSE 28090 28090

CMD [ "npm", "start" ]