import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  preview: {
    allowedHosts: ['ec2-15-135-113-101.ap-southeast-2.compute.amazonaws.com'],
  },
});

