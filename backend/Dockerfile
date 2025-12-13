# Builder stage
FROM python:3.11-alpine as builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    libffi-dev

COPY requirements.txt .

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt 
# Final stage
FROM python:3.11-alpine

WORKDIR /app

# Install runtime dependencies for Postgres
RUN apk add --no-cache \
    libpq \
    curl

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create and switch to non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    mkdir logs && \
    chown -R appuser:appgroup logs
USER appuser

# Copy application code
COPY --chown=appuser:appgroup . backend/

COPY --chown=appuser:appgroup entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 8000

# Set entrypoint and command
ENTRYPOINT ["./entrypoint.sh"]
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
