FROM node:16
#FROM arm32v7/node:latest
WORKDIR /opt/servicemon

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
# copy source code to /usr/src/app folder
COPY src /opt/servicemon/src

RUN npm install
RUN npm run build --production

EXPOSE 28090 28090

CMD [ "npm", "start" ]