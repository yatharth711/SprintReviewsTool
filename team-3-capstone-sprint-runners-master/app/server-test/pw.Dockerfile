# Use the official Node.js image as the base image
FROM node:latest

# Step 2: Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Step 3: Set the working directory
WORKDIR /app

# Step 4: Copy the ./app directory
COPY . .

# Step 5: Move to the specific server-test directory within the app
WORKDIR /app/server-test

COPY package.json package-lock.json* ./ 

# Step 6: Install Playwright and project dependencies
RUN npm install -D @playwright/test@latest && npm install

# Step 7: Install necessary browsers for Playwright
RUN npx playwright install --with-deps chromium

# Step 8: Optional Change working directory to tests directory to run tests from there

# Command to run tests can be specified here if needed, e.g.,
CMD ["npx", "playwright", "test"]
