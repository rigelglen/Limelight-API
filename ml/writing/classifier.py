import pickle
from .train_clf import train, prepare_text, USE_POS_TAG
import os.path as path
import numpy as np


def get_classifier():
    if _Classifier._instance is None:
        _Classifier._instance = _Classifier()
    return _Classifier._instance


class _Classifier:
    _instance = None

    def __init__(self):
        try:
            if USE_POS_TAG:
                modelFile = open(
                    path.join(path.dirname(__file__), "model-POS.xgb"), 'rb')
            else:
                modelFile = open(
                    path.join(path.dirname(__file__), "model.xgb"), 'rb')
            print("Writing Classifier loaded")

            if USE_POS_TAG:
                vectorizerFile = open(
                    path.join(path.dirname(__file__), "vectorizer-POS.tfidf"), 'rb')
            else:
                vectorizerFile = open(
                    path.join(path.dirname(__file__), "vectorizer.tfidf"), 'rb')
            print("Writing Vectorizer loaded")
            self.clf = pickle.load(modelFile)
            self.vectorizer = pickle.load(vectorizerFile)
            modelFile.close()
            vectorizerFile.close()

        except:
            self.clf, self.vectorizer = train()

    def classify(self, text):
        # predictions = self.clf.predict_proba(self.vectorizer.transform([text]))
        predictions = self.clf.predict_proba(
            self.vectorizer.transform([prepare_text(text)])).tolist()[0]
        probabilities = dict(zip(['real', 'fake'], predictions))
        return probabilities
