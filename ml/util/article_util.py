from newspaper import Article


def get_article(url):
    try:
        article = Article(url)
        article.download()
        article.parse()
        return article.title, article.text
    except:
        raise ValueError('Could not fetch the article')
