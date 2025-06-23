FROM python:3.12.3-slim

RUN useradd -m -u 1000 user

# Switch to the "user" user
USER user

# Set home to the user's home directory
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

ENV PYTHONUNBUFFERED=1

WORKDIR /backend

COPY --chown=user ./requirements.txt requirements.txt

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY --chown=user:user . .

EXPOSE 7860

CMD ["uvicorn", "main.app:app", "--host", "0.0.0.0", "--port", "7860"]
