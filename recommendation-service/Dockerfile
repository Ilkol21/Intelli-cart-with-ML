# recommendation-service/Dockerfile

FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# --- ОСТАТОЧНЕ ВИПРАВЛЕННЯ ---
# Запускаємо Python в небуферизованому режимі, щоб логи з'являлися негайно
CMD ["python", "-u", "consumer.py"]
