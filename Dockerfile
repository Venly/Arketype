FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY / ./
RUN npm install
RUN perl -pi -w -e 's/http:\/\/localhost:4000/https:\/\/demo.arkane.network/g' assets/js/main.js

EXPOSE 8080
CMD [ "npm", "run", "start-ext" ]
