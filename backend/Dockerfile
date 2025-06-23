FROM python:3.12.3-slim

ENV PYTHONUNBUFFERED=1
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /backend

COPY requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser . .

EXPOSE 8000

USER appuser

CMD ["fastapi", "run", "--app", "app"]
