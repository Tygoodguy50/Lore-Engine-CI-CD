# Multi-stage Dockerfile for Lore Engine
FROM alpine:3.19

# Install runtime dependencies, create user and directories
RUN apk --no-cache add ca-certificates curl tzdata && \
    addgroup -g 1000 lore && \
    adduser -D -s /bin/sh -u 1000 -G lore lore && \
    mkdir -p /app/config /app/docs /app/public /app/logs && \
    chown -R lore:lore /app

WORKDIR /app

# Copy existing binary and essential files
COPY local-ai.exe /app/local-ai

# Set permissions
RUN chmod +x /app/local-ai && \
    chown -R lore:lore /app

# Switch to non-root user
USER lore

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Default command
CMD ["./local-ai"]
