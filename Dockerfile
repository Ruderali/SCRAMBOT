# Dockerfile for SCRAMBOT
FROM node:18
WORKDIR /usr/src/app

# Dependencies
COPY package*.json ./
RUN npm install
RUN apt-get update && apt-get install -y ntp
COPY . .

# Network Config
EXPOSE 5000
EXPOSE 27017

# Start
CMD ["npm", "start", "seed"]
