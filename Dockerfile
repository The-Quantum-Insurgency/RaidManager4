FROM node:20.11.1-buster-slim


# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

CMD [ "node", "raidmanager", "start", "--skip-update" ]
