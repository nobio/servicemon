FROM will.be.overwritten.by.mock-build.values.yaml.baseImage

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY .

RUN npm set progress=false && \
    npm config set depth 0 && \
    npm install -g typescript && \
    npm install

# Bundle app source
RUN npm run build --production

# create database files (lokijs) and fix access rights
RUN touch monitor.db monitor.db.0
RUN chmod g+rw monitor.db*

EXPOSE 28090 

# set environment for logfile
ENV DEBUGLEVEL=info
#ENV LOGPATH=/var/log/mock
#ENV LOGFILE=upstreammon.log

CMD [ "npm", "start" ]
