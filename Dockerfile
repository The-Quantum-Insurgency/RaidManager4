FROM node:18.5.0-buster-slim

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

CMD [ "node", "raidmanager", "start", "--skip-update" ]
