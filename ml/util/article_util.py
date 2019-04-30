from newspaper import Article
from polyglot.detect import Detector

class ArticleError(Exception):
    def __init__(self, message):

        # Call the base class constructor with the parameters it needs
        super().__init__(message)

        # Now for your custom code...
        self.message = message

def get_article(url):
    try:
        article = Article(url)
        article.download()
        article.parse()
        if(len(article.text))<400:
            raise ArticleError('Article does not have enough text')
        detector = Detector(article.text)
        if detector.language.code != 'en':
            raise ArticleError('Article is not in english')
        return article.title, article.text
    except ValueError as e:
        raise ValueError('Could not fetch the article')
    except ArticleError as e:
        raise ValueError(e.message)
