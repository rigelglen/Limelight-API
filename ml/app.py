#!/usr/bin/env python3

# from flask import Flask, request, jsonify, make_response
# from waitress import serve

# from sanic import Sanic
# from sanic.response import json

from starlette.applications import Starlette
from starlette.responses import JSONResponse as json
import uvicorn

from clickbait import classifier as clickbait_clf
from writing import classifier as writing_clf
from sentiment import sentiment as senti
from keywords import keywords as key

import os
import urllib3
from util import article_util

debugFlag = True

print('Starlette is starting in ', os.getenv('APP_ENV'), " mode")

if(os.getenv('APP_ENV') == 'production'):
    debugFlag = False

app = Starlette(debug=debugFlag)


@app.route('/')
async def hello_world(request):
    return 'Flask!'


@app.route('/classify')
async def classify(request):
    if 'url' not in request.query_params:
        return json({"message": "Please pass a url"}, 400)
    try:
        url = request.query_params.get('url')
        if debugFlag:
            title, text = article_util.get_article(url)
        else:
            title, text = await article_util.async_get_article(url)
        resClickBait = clickbait_clf.get_classifier().classify(title)
        resSenti = senti.sentiment_analyzer_scores(text)
        resWriting = writing_clf.get_classifier().classify(text)
        res = {"clickbait": resClickBait,
               "sentiment": resSenti, "writing": resWriting}

        return json(res)
    except ValueError as e:
        return json({"message": str(e)}, 400)


@app.route('/clickbait')
async def clickbait(request):
    if 'url' not in request.query_params:
        return json({"message": "Please pass a url"}, 400)
    try:
        url = request.query_params.get('url')
        if debugFlag:
            title, _ = article_util.get_article(url)
        else:
            title, _ = await article_util.async_get_article(url)
        res = clickbait_clf.get_classifier().classify(title)
        return json(res)
    except ValueError as e:
        return json({"message": str(e)}, 400)


@app.route('/sentiment')
async def sentiment(request):
    if 'url' not in request.query_params:
        return json({"message": "Please pass a url"}, 400)
    try:
        url = request.query_params.get('url')
        if debugFlag:
            _, text = article_util.get_article(url)
        else:
            _, text = await article_util.async_get_article(url)
        res = senti.sentiment_analyzer_scores(text)
        return json(res)
    except ValueError as e:
        return json({"message": str(e)}, 400)


@app.route('/writing')
async def writing(request):
    if 'url' not in request.query_params:
        return json({"message": "Please pass a url"}, 400)
    try:
        url = request.query_params.get('url')
        if debugFlag:
            _, text = article_util.async_get_article(url)
        else:
            _, text = await article_util.async_get_article(url)
        res = writing_clf.get_classifier().classify(text)
        return json(res)
    except ValueError as e:
        return json({"message": str(e)}, 400)


@app.route('/keywords')
async def keywords(request):
    if 'text' not in request.query_params:
        return json({"message": "Please pass a url"}, 400)
    try:
        text = request.query_params.get('text')
        return json(key.get_keywords(text))
    except:
        return json({"message": "Could not get keywords"}, 400)


port = int(os.getenv('FLASK_PORT'))


# def runApp():
#     uvicorn.run(app, host=os.getenv('FLASK_HOST'),
#                 port=port, access_log=False)


# if __name__ == '__main__':
#     runApp()
