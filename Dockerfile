FROM python:3.11-slim

# cache bust 2

WORKDIR /app

COPY sq2cube-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sq2cube-backend/ .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]