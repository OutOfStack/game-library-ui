# Stage 1 - Build app
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json /usr/src/app/

# Install dependencies
RUN npm install --silent

# Copy the rest of the app's source code
COPY . /usr/src/app

# Build the app for production
RUN npm run build

# Stage 2 - Run app with Nginx
FROM nginx:1.27-alpine

# Install bash for env.sh
RUN apk add --no-cache bash

# Copy the built app to Nginx's default static file serving directory
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Set read permissions on all built files
RUN chmod -R 644 /usr/share/nginx/html/* && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \;

WORKDIR /usr/share/nginx/html

# Copy Env config
COPY env.sh .env ./
RUN chmod +x env.sh

# Default port exposure
EXPOSE 80

# Run the environment script before starting Nginx
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
