import glob
import numpy as np
import nltk
from operator import itemgetter
from sklearn import metrics
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
import pickle
import pandas as pd
import os.path as path


def train():
    df = pd.read_csv(path.join(path.dirname(
        __file__), 'data/scrapeResult.csv'))

    missing_rows = []
    
    for i in range(len(df)):
        if df.loc[i, 'text'] != df.loc[i, 'text']:
            missing_rows.append(i)

    df = df.drop(missing_rows).reset_index().drop(['index', 'id'], axis=1)

    df = df.drop_duplicates(subset='text', keep='first')
    df = df.drop_duplicates(subset='link', keep='first')

    count_fake = 0
    count_real = 0

    for index, row in df.iterrows():
        if row['label'] == 1:
            if count_fake > 5000:
                #       print(df.index[index])
                df.drop([df.index[index]])
                continue
            count_fake += 1
        else:
            count_real += 1
    print("Number of fake articles is ", count_fake)
    print("Number of real articles is ", count_real)

    # Set `y`
    y = df.label



    # Drop the `label` column
    df.drop("label", axis=1)

    # Make training and test sets
    X_train, X_test, Y_train, Y_test = train_test_split(
        df['text'], y, test_size=0.2, random_state=53)

    # Initialize the `tfidf_vectorizer`
    vectorizer = TfidfVectorizer(sublinear_tf=True,
                                 ngram_range=(1, 2),
                                 stop_words='english',
                                 max_df=0.8,
                                 min_df=0.01,
                                 max_features=5000,
                                 strip_accents='unicode')

    # Fit and transform the training data
    X_train = vectorizer.fit_transform(X_train)

    # Transform the test set
    X_test = vectorizer.transform(X_test)

    clf = XGBClassifier()
    clf.fit(X_train, Y_train)
    Y_predicted = clf.predict(X_test)
    score = metrics.accuracy_score(Y_test, Y_predicted)
    print("Accuracy:   %0.3f" % score)
    print("Classification Report")
    print(metrics.classification_report(Y_test, Y_predicted))

    modelFile = path.join(path.dirname(__file__), "model.xgb")
    outfile = open(modelFile, 'wb')
    pickle.dump(clf, outfile)
    outfile.close()

    vectorizerFile = path.join(path.dirname(__file__), "vectorizer.tfidf")
    outfile = open(vectorizerFile, 'wb')
    pickle.dump(vectorizer, outfile)
    outfile.close()

    return clf, vectorizer
