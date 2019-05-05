#!/bin/sh

if [ $APP_ENV = "production" ]; then
  gunicorn -w 2 -k uvicorn.workers.UvicornWorker -b $FLASK_HOST:$FLASK_PORT --log-level warning --timeout 240 app:app;
else
  # python app.py
  uvicorn --reload --host $FLASK_HOST --port $FLASK_PORT app:app;
  # gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b $FLASK_HOST:$FLASK_PORT app:app;
fi