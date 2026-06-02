FROM node:20-alpine
WORKDIR /deps
COPY package.json package-lock.json ./
RUN npm install
ENV NODE_PATH=/deps/node_modules
WORKDIR /app
EXPOSE 3001
ENV HOST=0.0.0.0
CMD ["node", "app.js"]
