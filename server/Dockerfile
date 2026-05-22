# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy the rest of the backend files
COPY . .

# Expose the API port
EXPOSE 5000

# Start the Express server
CMD ["node", "server.js"]
