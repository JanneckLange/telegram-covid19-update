FROM node:13-alpine

WORKDIR /usr/src/app

# Copy package.json to the WORKDIR
COPY package*.json ./

# set timezone
RUN apk add --no-cache tzdata
ENV TZ=Europe/Berlin
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install Dependencys
RUN npm install;

# Copy server.js, etc...
COPY . .

# Run the scripts command in the package.json
CMD ["npm", "start"]
