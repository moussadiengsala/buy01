FROM node:18-alpine

WORKDIR /app

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy remaining files
COPY . .

# Expose port
EXPOSE 4200

# Start command (using global ng)
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--disable-host-check"]