#!/bin/sh
set -e

cd /app

echo "Syncing database schema..."
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy
else
  npx prisma db push --skip-generate
fi

echo "Starting Product Docs..."
exec npm start
