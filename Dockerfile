FROM node:19

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY / ./
RUN yarn install

EXPOSE 8080
CMD [ "yarn", "run", "start-ext" ]
