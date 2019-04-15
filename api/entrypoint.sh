#!/bin/sh

until nc -z $MONGO_HOST $MONGO_PORT
do
    echo "Waiting for Mongo ($MONGO_HOST:$MONGO_PORT) to start..."
    sleep 1
done

until nc -z $FLASK_HOST $FLASK_PORT
do
    echo "Waiting for Flask ($FLASK_HOST:$FLASK_PORT) to start..."
    sleep 1
done

until nc -z $REDIS_HOST $REDIS_PORT
do
    echo "Waiting for Redis ($REDIS_HOST:$REDIS_PORT) to start..."
    sleep 1
done

if [ $APP_ENV = "production" ]; then
  node index.js;
else
  nodemon index.js -L;
fi