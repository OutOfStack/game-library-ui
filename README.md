# game-library-ui

## Introduction

game-library-ui is the user interface of the game-library web application, a web application for exploring and rating games. It's built with React and TypeScript.

This service is part of a game-library web application:
- [game-library](https://github.com/OutOfStack/game-library) - backend service responsible for fetching, storing games data and providing API for UI
- [game-library-auth](https://github.com/OutOfStack/game-library-auth) - authentication and authorization service
- current service is responsible for UI

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Configuration](#configuration)
- [Development](#development)
- [Build and Deployment](#build-and-deployment)
- [License](#license)

## Installation

Prerequisites: `Node.js`, `npm`, `Make` (optional)

1. Clone the repository:
   ```bash
   git clone https://github.com/OutOfStack/game-library-ui.git
   cd game-library-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the application:

   Edit the `.env` file to point to your backend and auth services:
   ```
   GAMES_URL=http://localhost:8000  # URL to the games backend service
   AUTH_URL=http://localhost:8001   # URL to the auth service
   ```

4. Start the development server:
   ```bash
   ./env.sh # generates config from env variables
   npm run dev
   # or with Make
   make run
   ```

## Usage

After installation, the application will be available at `http://localhost:3000`.

For a complete game-library experience, you'll need to set up the following services:
- [game-library](https://github.com/OutOfStack/game-library) - Backend service
- [game-library-auth](https://github.com/OutOfStack/game-library-auth) - Auth service

## Features

- Browse, search and rate games
- View detailed game information
- User authentication and authorization

## Tech Stack

- Built with React, TypeScript, Vite and Material-UI.
- Uses Nginx as a web server for serving the app in production.
- CI/CD with GitHub Actions and deploy to Kubernetes (microk8s) cluster.

## Configuration

The application can be configured using the following environment variables in the [.env](./.env) file:

- `GAMES_URL`: URL to the games backend service
- `AUTH_URL`: URL to the authentication service

Additional configuration options can be set in [vite.config.ts](./vite.config.ts) for the development server.

## Development

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run preview`: Preview the production build locally
- `npm test`: Run tests

### Make Commands

If you prefer using Make, the following commands are available:

- `make run`: Start the development server
- `make build`: Build the application for production
- `make test`: Run tests

## Build and Deployment

### Building for Production

```bash
npm run build
# or with Make
make build
```

This will create a production-ready build in the `build` directory.

### Docker Deployment

A multi-stage Dockerfile is provided for containerized deployment:

```bash
# Build the Docker image
docker build -t game-library-ui .

# Run the container
docker run -p 3000:3000 game-library-ui
```

The Dockerfile:
1. Builds the application using Node.js
2. Serves the built files using Nginx
3. Configures environment variables at runtime

## License

[MIT License](./LICENSE.md)
