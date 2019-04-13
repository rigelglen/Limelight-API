FROM conda/miniconda3:latest

# Create app folder
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Cache npm dependencies
COPY requirements.txt /usr/app/
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . /usr/app

EXPOSE 3001

CMD ["python", "app.py"]
