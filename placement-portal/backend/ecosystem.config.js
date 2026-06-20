module.exports = {
  apps: [
    {
      name: 'placement-portal-backend',
      script: 'server.js',
      instances: 'max',             // Utilize all available vCPUs
      exec_mode: 'cluster',          // Run in cluster mode for zero-downtime reloads
      watch: false,                 // Do not watch in production to avoid infinite reload loops
      max_memory_restart: '1G',     // Restart if process memory exceeds 1GB (prevention against memory leaks)
      env: {
        NODE_ENV: 'development',
        PORT: 4000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: 'logs/pm2_err.log',
      out_file: 'logs/pm2_out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
