FROM node:16
WORKDIR /usr/src/app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn client
COPY . .
RUN yarn build
COPY . .
EXPOSE 8000
CMD ["yarn", "start"]
