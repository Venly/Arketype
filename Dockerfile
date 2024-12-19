# ===========================================================
# Build Stage
# ===========================================================
FROM node:lts-alpine AS build

WORKDIR /usr/src/app

RUN apk add --no-cache \
    python3 \
    g++ \
    make

COPY package.json yarn.lock* ./

RUN yarn install --frozen-lockfile || yarn install

COPY . .

# ===========================================================
# Runtime image
# ===========================================================
FROM  node:lts-alpine AS runtime

WORKDIR /usr/src/app

RUN apk add --no-cache \
    curl
# Copy only the necessary files
COPY --from=build /usr/src/app /usr/src/app

USER node

EXPOSE 4000
CMD ["yarn", "run", "start-ext"]
