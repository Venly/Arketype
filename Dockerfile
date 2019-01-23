FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY * ./
RUN npm install
RUN pwd && ls -l && perl -pi -w -e 's/https:\/\/localhost:4000/https:\/\/demo.arkane.network/g' assets/js/main.js
COPY . .

EXPOSE 8080
CMD [ "npm", "run", "start" ]
