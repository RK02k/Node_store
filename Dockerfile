# Use Node.js LTS image
FROM node:lts

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy application files
COPY . .

# Expose port and start the server
EXPOSE 3000
CMD ["node", "app.js"]