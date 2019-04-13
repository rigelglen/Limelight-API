FROM node:11.13.0-alpine

# Create app folder
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Cache npm dependencies
COPY package*.json /usr/app/
RUN npm install && npm cache clean --force

RUN npm install -g nodemon

# Copy application files
COPY . /usr/app

EXPOSE 8080

CMD ["sh", "entrypoint.sh"]
