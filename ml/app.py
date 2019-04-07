from flask import Flask, request, jsonify, make_response
from clickbait import classifier
from sentiment import sentiment as senti
from util import article_util
from keywords import keywords as key

import urllib3
app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Flask!'


@app.route('/clickbait')
def clickbait():
    if 'url' not in request.args:
        return make_response(jsonify(message="Please pass a url"), 400)

    url = request.args.get('url')
    title, _ = article_util.get_article(url)
    res = classifier.get_classifier().classify(title)
    if(res == False):
        return make_response(jsonify(message="Could not fetch the article"), 400)
    print(res)
    return jsonify(res)


@app.route('/sentiment')
def sentiment():
    if 'url' not in request.args:
        return make_response(jsonify(message="Please pass a url"), 400)

    url = request.args.get('url')
    _, text = article_util.get_article(url)
    res = senti.sentiment_analyzer_scores(text)
    if(res == False):
        return make_response(jsonify(message="Could not fetch the article"), 400)
    # print(res)
    return jsonify(res)


@app.route('/keywords')
def keywords():
    if 'text' not in request.args:
        return make_response(jsonify(message="Please pass a url"), 400)
    text = request.args.get('text')
    return jsonify(key.get_keywords(text))


if __name__ == '__main__':
    app.run(debug=True, host='localhost', port='4202')
