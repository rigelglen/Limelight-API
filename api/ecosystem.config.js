const path = require('path');

module.exports = {
  apps: [
    {
      name: 'app',
      script: 'index.js',
      instances: -1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: process.env.NODE_ENV === 'development',
      watch_options: {
        followSymlinks: false,
        usePolling: true,
      },
      ignore_watch: [ 'node_modules', 'error.log' ],
      max_memory_restart: '1G',
    },
  ],
};
