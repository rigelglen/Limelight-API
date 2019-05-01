from newspaper import Article, ArticleException
from polyglot.detect import Detector
import json
from datetime import date
import functools
from aioify import aioify


class ArticleError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message


def get_article(url):
    try:
        article = Article(url)
        article.download()
        article.parse()
        if(article.meta_data.get("og", "").get("type") != 'article' and not len(article.text) > 1000):
            raise ArticleError('Link is not an article')
        if(len(article.text)) < 400:
            raise ArticleError('Article does not have enough text')
        detector = Detector(article.text)
        if detector.language.code != 'en':
            raise ArticleError('Article is not in english')
        return article.title, article.text
    except (ValueError, ArticleException) as e:
        raise ValueError('Could not fetch the article')
    except ArticleError as e:
        raise ValueError(e.message)
    except AttributeError as e:
        raise ValueError('Link is not an article')


async_get_article = aioify(obj=get_article)
