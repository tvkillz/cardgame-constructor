FROM node:20-alpine

# Add development dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies and ensure node_modules permissions
RUN npm install && \
    npm install -g nodemon && \
    npm cache clean --force && \
    mkdir -p node_modules && \
    chown -R node:node .

# Set environment variable for better file watching
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

# Switch to non-root user
USER node

# Expose port
EXPOSE 6001
# Use the development server by default
CMD ["npm", "run", "dev"] 
