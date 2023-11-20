# Use the official Node.js image with the specified version
FROM node:18.15.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port that your app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start","src/server.js"]
