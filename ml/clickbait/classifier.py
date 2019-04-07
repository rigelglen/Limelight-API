import numpy as np
import pickle
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
            modelFile = open('./clickbait/model.svm', 'rb')
            vectorizerFile = open('./clickbait/vectorizer.tfidf', 'rb')
            self.clf = pickle.load(modelFile)
            self.vectorizer = pickle.load(vectorizerFile)
            modelFile.close()
            vectorizerFile.close()
        except:
            self.clf, self.vectorizer = train()

    def classify(self, title):
        predictions = self.clf.predict_proba(
            self.vectorizer.transform(np.array([title_cleaner(title, TRAIN_ON_PARTS_OF_SPEECH)])))[0]
        probabilities = dict(zip(self.clf.classes_, predictions))
        return probabilities
