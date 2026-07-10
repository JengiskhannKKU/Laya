#!/usr/bin/env bash
# Runs ON THE VPS (as the `deploy` user) — pulls latest main, rebuilds, restarts via PM2.
# Invoked by .github/workflows/deploy.yml over SSH on every push to main.
set -euo pipefail

cd /home/deploy/laya

echo "==> Pulling latest main"
git fetch origin main
git reset --hard origin/main

echo "==> Installing dependencies"
npm run install:all

echo "==> Building backend"
(cd backend && npm run build)

echo "==> Building frontend"
(cd frontend && npm run build)

echo "==> Restarting via PM2"
pm2 restart ecosystem.config.js --update-env
pm2 save

echo "==> Deploy complete"
