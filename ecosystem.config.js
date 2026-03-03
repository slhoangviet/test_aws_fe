module.exports = {
  apps: [
    {
      name: 'test_aws_fe',
      script: 'node_modules/vite/bin/vite.js',
      // Production: build trước rồi chạy preview:
      //   cd test_aws_fe && yarn install && yarn build
      args: 'preview --host 0.0.0.0 --port 4173',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      watch: false,
    },
  ],
};

