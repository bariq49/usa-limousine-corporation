#!/bin/sh
set -eu

cd /app/apps/backend

echo "Prisma migration status (before):"
pnpm exec prisma migrate status || true

echo "Applying Prisma migrations..."
if ! pnpm exec prisma migrate deploy; then
  echo "ERROR: prisma migrate deploy failed — see output above"
  exit 1
fi

echo "Prisma migration status (after):"
pnpm exec prisma migrate status

echo "Starting USA Limousine Corporation API..."
exec node dist/main.js
