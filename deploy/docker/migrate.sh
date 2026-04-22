#!/bin/sh

set -eu

attempt=1
max_attempts="${MIGRATION_MAX_ATTEMPTS:-20}"
delay_seconds="${MIGRATION_RETRY_DELAY_SECONDS:-5}"

while [ "$attempt" -le "$max_attempts" ]; do
  echo "Applying EF Core migrations (attempt ${attempt}/${max_attempts})..."

  if dotnet ef database update \
    --project src/TaskFlow.Infrastructure/TaskFlow.Infrastructure.csproj \
    --startup-project src/TaskFlow.API/TaskFlow.API.csproj; then
    echo "Migrations applied successfully."
    exit 0
  fi

  if [ "$attempt" -eq "$max_attempts" ]; then
    echo "Migration step failed after ${max_attempts} attempts." >&2
    exit 1
  fi

  attempt=$((attempt + 1))
  sleep "$delay_seconds"
done
