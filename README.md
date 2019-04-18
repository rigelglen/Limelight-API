# Limelight API

REST API back-end for Limelight - a news app that uses machine learning to analyze and classify unreliable news articles.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

- Tested Docker v18.09 (Lower versions may also work but have not been tested)
- Docker Compose v1.23.1 (Lower versions may also work but have not been tested)

### Installing

A step by step series of examples that tell you how to get a development env running. It assumes you have already installed docker with docker-compose.

Clone the respository

```
git clone https://gitlab.com/mirandajyothy/limelight_api.git
cd limelight_api
```

Make adjustments to the sample env file to fit your needs. Make sure it is in the same directory as the docker-compose.yml file

Run docker-compose to start up the app service

```
docker-compose up app
```

If something goes wrong in this step, run docker-compose down and try again. Also, if you are using the sample env without any changes, make sure there is no other app running on the 8080 (Node) port and the 27018 (MongoDB) port.

## Running tests

Same as above, just instead of starting up the app service, run the app-test service.

```
docker-compose up app-test
```

## Deployment

Run it alongside an nginx server set up as a reverse proxy to send requests to port 8080 (you can configure this in the .env file)
When deploying, use the docker-compose.deploy.yml file since it does not mount the host filesystem.

```
docker-compose -f docker-compose.deploy.yml
```

## Built With

* [Docker](https://www.docker.com/) - For containerization
* [Express](https://expressjs.com/) - For REST API
* [Flask](http://flask.pocoo.org/) - For serving the machine learning models


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [Peter Down's Clickbait classifier](https://github.com/peterldowns/clickbait-classifier)
* [Scoring an article reliability](https://medium.com/@malik.boudiaf/scoring-an-article-reliability-9f9a2445c7e8)
