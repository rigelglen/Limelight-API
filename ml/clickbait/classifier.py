import glob
import json
import numpy
import sys
import nltk
from operator import itemgetter
from random import shuffle
from sklearn import metrics
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
import pickle
import os
from .train_clf import train, title_cleaner, TRAIN_ON_PARTS_OF_SPEECH
from newspaper import Article


def get_classifier():
    if _Classifier._instance is None:
        _Classifier._instance = _Classifier()
    return _Classifier._instance


class _Classifier:
    _instance = None

    def __init__(self):
        try:
            modelFile = open('./model.svm', 'rb')
            vectorizerFile = open('./vectorizer.tfidf', 'rb')
            self.clf = pickle.load(modelFile)
            self.vectorizer = pickle.load(vectorizerFile)
        except:
            self.clf, self.vectorizer = train()

    def classify(self, url):
        article = Article(url)
        article.download()
        article.parse()
        title = article.title
        predictions = self.clf.predict_proba(
            self.vectorizer.transform(numpy.array([title_cleaner(title, TRAIN_ON_PARTS_OF_SPEECH)])))[0]
        probabilities = dict(zip(self.clf.classes_, predictions))
        return probabilities
