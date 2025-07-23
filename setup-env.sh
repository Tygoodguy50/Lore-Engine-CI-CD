#!/bin/sh
# setup-env.sh: Initialize environment for all services
cp .env.example .env
if [ $? -eq 0 ]; then
  echo ".env created from .env.example."
else
  echo "Failed to create .env file." >&2
  exit 1
fi
