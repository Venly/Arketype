# Build stage
FROM --platform=linux/arm64 node:alpine AS build

# Create app directory
WORKDIR /usr/src/app

# Install build dependencies
RUN apk add --no-cache \
    curl \
    python3 \
    g++ \
    make

# Copy package.json and yarn.lock (if available) to install dependencies first
COPY package.json ./
COPY yarn.lock* ./

# Install app dependencies
RUN yarn install --frozen-lockfile --production || yarn install --production

# Copy the rest of the application files
COPY . .

# Final stage
FROM --platform=linux/arm64 node:alpine AS final

# Create app directory
WORKDIR /usr/src/app

# Copy built application from the build stage
COPY --from=build /usr/src/app /usr/src/app

# Set Environment Variables for Datadog in the final container
ARG VERSION
ARG DD_GIT_REPOSITORY_URL
ARG DD_GIT_COMMIT_SHA

ENV VERSION=${VERSION}
ENV DD_GIT_REPOSITORY_URL=${DD_GIT_REPOSITORY_URL}
ENV DD_GIT_COMMIT_SHA=${DD_GIT_COMMIT_SHA}

# Expose the port
EXPOSE 8080

# Clean up any unnecessary files to keep the image small
RUN rm -rf /usr/src/app/node_modules/.cache \
    && yarn cache clean \
    && rm -rf /var/cache/apk/*

# Start the application
CMD ["yarn", "run", "start-ext"]
