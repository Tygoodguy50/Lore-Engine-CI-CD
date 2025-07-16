# Multi-stage Dockerfile for Lore Engine
FROM golang:1.21-alpine AS builder

# Install build dependencies and setup Bazel
RUN apk add --no-cache git ca-certificates && \
    wget -O /usr/local/bin/bazel https://github.com/bazelbuild/bazel/releases/download/7.0.0/bazel-7.0.0-linux-x86_64 && \
    chmod +x /usr/local/bin/bazel

WORKDIR /app

# Copy source code
COPY . .

# Build the application
RUN bazel build //:local-ai

# Runtime stage
FROM alpine:3.19

# Install runtime dependencies, create user and directories
RUN apk --no-cache add ca-certificates tzdata && \
    addgroup -g 1000 lore && \
    adduser -D -s /bin/sh -u 1000 -G lore lore && \
    mkdir -p /app/config /app/docs /app/public /app/logs && \
    chown -R lore:lore /app

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/bazel-bin/local-ai /app/local-ai
COPY --from=builder /app/.env.production /app/.env.production
COPY --from=builder /app/launch.sh /app/launch.sh
COPY --from=builder /app/deploy-community-api.sh /app/deploy-community-api.sh
COPY --from=builder /app/config /app/config
COPY --from=builder /app/docs /app/docs
COPY --from=builder /app/public /app/public

# Set permissions
RUN chmod +x /app/local-ai /app/launch.sh /app/deploy-community-api.sh && \
    chown -R lore:lore /app

# Switch to non-root user
USER lore

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Default command
CMD ["./launch.sh", "--env=production"]
