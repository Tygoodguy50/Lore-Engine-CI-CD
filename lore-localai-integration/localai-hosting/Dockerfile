# LocalAI Hosting Configuration
# This dockerfile extends the base LocalAI image with custom models and configurations

FROM quay.io/go-skynet/local-ai:latest

# Set environment variables
ENV MODELS_PATH=/models
ENV CONFIG_PATH=/config
ENV THREADS=4
ENV CONTEXT_SIZE=4096
ENV UPLOAD_LIMIT=20
ENV GALLERIES="[]"
ENV PRELOAD_MODELS="[]"

# Create necessary directories
RUN mkdir -p /models /config /data /uploads

# Copy model configurations
COPY models/ /models/
COPY config/ /config/

# Copy custom scripts
COPY scripts/ /scripts/
RUN chmod +x /scripts/*.sh

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -s /bin/bash localai
RUN chown -R localai:localai /models /config /data /uploads /scripts

# Switch to non-root user
USER localai

# Set working directory
WORKDIR /

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Labels
LABEL name="lore-localai-hosting"
LABEL description="LocalAI server with custom Lore models"
LABEL version="1.0.0"
LABEL maintainer="Lore Engine Team"

# Entry point
ENTRYPOINT ["/scripts/entrypoint.sh"]
