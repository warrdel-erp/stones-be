FROM node:22-alpine

# Enable pnpm
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install 

# Copy the rest of the application code
COPY . .

RUN pnpm run build

# Expose the port the app runs on
EXPOSE 6007

# Start the application from compiled JS
CMD ["pnpm", "start"]

