// PM2 process file. Start with: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "chess-club-manager",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      env: { NODE_ENV: "production" },
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
    },
  ],
};
