FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --timeout 60 --retries 10 -r requirements.txt

COPY server.py .

RUN useradd -m appuser
USER appuser

EXPOSE 8001
CMD ["python", "server.py"]
