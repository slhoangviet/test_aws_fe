module.exports = {
  apps: [
    {
      name: 'test_aws_fe',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      cwd: __dirname,
      env: {
        PORT: 3000,
      },
      watch: false,
    },
  ],
};
