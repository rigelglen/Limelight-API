#!/bin/sh

if [ $APP_ENV = "production" ]; then
  node index.js;
else
  nodemon index.js -L;
fi