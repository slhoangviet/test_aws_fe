module.exports = {
  apps: [
    {
      name: 'test_aws_fe',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      watch: false,
    },
  ],
};
