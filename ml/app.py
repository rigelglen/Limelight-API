from flask import Flask, request, jsonify, make_response
from clickbait import classifier
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
    res = classifier.get_classifier().classify(url)
    if(res == False):
        return make_response(jsonify(message="Could not fetch the article"), 400)
    # print(res)
    return jsonify(**res)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port='4202')
