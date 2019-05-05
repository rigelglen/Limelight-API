FROM conda/miniconda3:latest

# Create app folder
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Cache npm dependencies
COPY requirements.txt /usr/app/
RUN apt-get update && apt-get install -y apt-transport-https
RUN apt-get install -y libicu-dev
RUN apt-get install -y build-essential 
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_md
# Copy application files
COPY . /usr/app

EXPOSE 3001

RUN chmod 644 app.py

CMD ["sh", "entrypoint.sh"]
