FROM node:12.1.0-alpine

# Create app folder
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Cache npm dependencies
COPY package*.json /usr/app/
RUN npm install && npm cache clean --force

# Copy application files
COPY . /usr/app

EXPOSE 8080

CMD ["sh", "entrypoint.sh"]
