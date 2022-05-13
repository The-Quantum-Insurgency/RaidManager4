FROM node:16

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

CMD [ "node", "raidmanager", "start", "--skip-update" ]
