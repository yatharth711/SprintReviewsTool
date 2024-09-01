# Use the official Node.js 16 image as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy the content of the local src directory to the working directory
COPY ./app .

# Check if package.json and package-lock.json exist and install dependencies
# This uses a wildcard to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# If you are using Yarn, you can uncomment the following lines instead
# COPY package.json yarn.lock ./
# RUN yarn install --frozen-lockfile

# Add custom environment variables for database communication or others
# Replace these values with your actual environment variables
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application using Next.js development server
CMD ["npm", "run", "dev"]