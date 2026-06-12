FROM node:20-alpine

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port 5173
EXPOSE 5173

# Run Vite dev server
CMD ["npm", "run", "dev"]
