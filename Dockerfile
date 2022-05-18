FROM node:alpine
WORKDIR /opt/servicemon

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
# copy source code to /usr/src/app folder
COPY src /opt/servicemon/src

# Install python/pip
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN apk add python3 g++ make
#RUN npm install sqlite3
RUN apk add make

RUN npm ci
RUN npm run build --production
RUN rm -rf ./src

# create database files (lokijs) and fix access rights
RUN touch monitor.db monitor.db.0
RUN chmod g+rw monitor.db*

EXPOSE 28090 28090

CMD [ "npm", "start" ]