module.exports = {
  apps: [
    {
      name: 'speech-practice',
      script: './dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 5000,
      log_file: './logs/pm2.log',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
    }
  ]
};
