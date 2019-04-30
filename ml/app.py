#!/usr/bin/env python3

from flask import Flask, request, jsonify, make_response
from waitress import serve

from clickbait import classifier as clickbait_clf
from writing import classifier as writing_clf
from sentiment import sentiment as senti
from keywords import keywords as key

import os
import urllib3
from util import article_util

app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Flask!'


@app.route('/classify')
def classify():
    if 'url' not in request.args:
        return make_response(jsonify(message="Please pass a url"), 400)
    try:
        url = request.args.get('url')
        title, text = article_util.get_article(url)
        resClickBait = clickbait_clf.get_classifier().classify(title)
        resSenti = senti.sentiment_analyzer_scores(text)
        resWriting = writing_clf.get_classifier().classify(text)
        res = {"clickbait": resClickBait, "sentiment": resSenti, "writing": resWriting}

        return jsonify(res)
    except ValueError as e:
        return make_response(jsonify(message=str(e)), 400)


@app.route('/clickbait')
def clickbait():
    if 'url' not in request.args:
        return make_response(jsonify(message="Please pass a url"), 400)
    try:
        url = request.args.get('url')
        title, _ = article_util.get_article(url)
        res = clickbait_clf.get_classifier().classify(title)
        return jsonify(res)
    except ValueError as e:
        return make_response(jsonify(message=str(e)), 400)


@app.route('/sentiment')
def sentiment():
    if 'url' not in request.args:
        return make_response(jsonify(message="Please pass a url"), 400)
    try:
        url = request.args.get('url')
        _, text = article_util.get_article(url)
        res = senti.sentiment_analyzer_scores(text)
        return jsonify(res)
    except ValueError as e:
        return make_response(jsonify(message=str(e)), 400)


@app.route('/writing')
def writing():
    if 'url' not in request.args:
        return make_response(jsonify(message="Please pass a url"), 400)
    try:
        url = request.args.get('url')
        _, text = article_util.get_article(url)
        res = writing_clf.get_classifier().classify(text)
        return jsonify(res)
    except ValueError as e:
        return make_response(jsonify(message=str(e)), 400)


@app.route('/keywords')
def keywords():
    if 'text' not in request.args:
        return make_response(jsonify(message="Please pass some text"), 400)
    try:
        text = request.args.get('text')
        return jsonify(key.get_keywords(text))
    except:
        return make_response(jsonify(message="Could not get keywords"), 400)


port = int(os.getenv('FLASK_PORT'))

debugFlag = True

print('Flask is starting...')

if(os.getenv('APP_ENV') == 'production'):
    debugFlag = False
if __name__ == '__main__':
    if debugFlag:
        app.run(debug=debugFlag, host=os.getenv('FLASK_HOST'),
                port=port)
    else:
        print("Waitress server running on port ", port)
        serve(app, host=os.getenv('FLASK_HOST'), port=port)
