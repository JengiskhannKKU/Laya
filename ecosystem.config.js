// PM2 process definitions for production (VPS deploy) — see deploy.sh and
// .github/workflows/deploy.yml for how this is used.
module.exports = {
  apps: [
    {
      name: 'laya-backend',
      cwd: '/home/deploy/laya/backend',
      script: 'dist/server.js',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '400M',
    },
    {
      name: 'laya-frontend',
      cwd: '/home/deploy/laya/frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '600M',
    },
  ],
};
