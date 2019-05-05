import glob
import json
import numpy as np
import nltk
from operator import itemgetter
from sklearn import metrics
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
import pickle
import pandas as pd
import os.path as path
import os


def category_cleaner(category):
    return 'clickbait' if category else 'news'


def title_cleaner(title, pos=False):
    if pos:
        return ' '.join(map(itemgetter(1), nltk.pos_tag(nltk.word_tokenize(title.lower()))))
    else:
        return title


def str_to_bool(s):
    if str(s) == 'True' or str(s) == 'true':
        return True
    elif str(s) == 'False' or str(s) == 'false':
        return False
    else:
        raise ValueError  # evil ValueError that doesn't tell you what the wrong value was


TRAIN_ON_PARTS_OF_SPEECH = str_to_bool(os.getenv('USE_POS_CLICKBAIT') or True)


def train():
    cwd = path.join(path.dirname(__file__), 'data/pos/*.json')
    # Make this `True` to train on parts of speech instead of words.
    print("Started clickbait training...")
    if TRAIN_ON_PARTS_OF_SPEECH:
        cwd = path.join(path.dirname(__file__), 'data/pos/*.json')
        data_files = glob.glob(cwd)
    else:
        cwd = path.join(path.dirname(__file__), 'data/*.json')
        data_files = glob.glob(cwd)

    # All of these complicated splits are used to ensure that there are both types
    # of article titles (clickbait and news) in the training set.
    training_proportion = 0.8
    training_data = []
    testing_data = []
    for filename in data_files:
        with open(filename, 'rb') as in_f:
            dataset = json.load(in_f)
            cutoff = int(round(len(dataset) * training_proportion))
            training_data.extend(dataset[0:cutoff])
            testing_data.extend(dataset[cutoff:])
            print('Loaded %d headlines from %s' % (len(dataset), filename))

    train_df = pd.DataFrame.from_dict(training_data, orient='columns')
    test_df = pd.DataFrame.from_dict(testing_data, orient='columns')

    train_df = train_df.filter(['article_title', 'clickbait'])
    test_df = test_df.filter(['article_title', 'clickbait'])

    train_df['clickbait'] = np.where(
        (train_df['clickbait'] == 1), 'clickbait', 'news')
    test_df['clickbait'] = np.where(
        (test_df['clickbait'] == 1), 'clickbait', 'news')

    X_train = np.array(train_df['article_title'].values)
    Y_train = np.array(train_df['clickbait'].values)
    X_test = np.array(test_df['article_title'].values)
    Y_test = np.array(test_df['clickbait'].values)
    assert len(X_train) == len(Y_train) > 0
    assert len(X_test) == len(Y_test) > 0

    vectorizer = TfidfVectorizer(ngram_range=(1, 3),
                                 lowercase=True,
                                 stop_words='english',
                                 strip_accents='unicode',
                                 min_df=2,
                                 norm='l2')

    X_train = vectorizer.fit_transform(X_train)  # Fit and then transform
    clf = SVC(kernel='linear', probability=True)
    clf.fit(X_train, Y_train)

    X_test = vectorizer.transform(X_test)
    Y_predicted = clf.predict(X_test)

    print('Classification report clickbait:')
    print(metrics.classification_report(Y_test, Y_predicted))
    print('')

    if TRAIN_ON_PARTS_OF_SPEECH:
        modelFile = path.join(path.dirname(__file__),
                              "model-POS.svm")
    else:
        modelFile = path.join(path.dirname(__file__),
                              "model.svm")

    outfile = open(modelFile, 'wb')
    pickle.dump(clf, outfile)
    outfile.close()

    if TRAIN_ON_PARTS_OF_SPEECH:
        vectorizerFile = path.join(path.dirname(
            __file__), "vectorizer-POS.tfidf")
    else:
        vectorizerFile = path.join(path.dirname(__file__),
                                   "vectorizer.tfidf")

    outfile = open(vectorizerFile, 'wb')
    pickle.dump(vectorizer, outfile)
    outfile.close()
    return clf, vectorizer


# train()
