FROM node:20-alpine

RUN mkdir -p /home/server
WORKDIR /home/server

COPY package.json yarn.lock .env ./
RUN yarn

COPY . .

CMD [ "yarn", "start"]
