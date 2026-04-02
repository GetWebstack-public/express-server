# GWS Playground API

An Express-based API playground application for testing and experimentation.

## Quick Start

From the project root directory:

```bash
gws init
gws up
```

This will start the API along with all other services defined in the workspace.

The API will be available at: https://gws-playground-api.gws-playground.local.getwebstack.dev:9443/

## Available Scripts

- `npm start` - Run the API server

## Tech Stack

- Node.js
- Express 4
- Morgan (logging)
- Pug (templating)

## Docker

```bash
docker build -t gws-playground-api .
docker run -p 3000:3000 gws-playground-api
```
