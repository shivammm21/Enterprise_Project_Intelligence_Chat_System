import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Allow access from network
    allowedHosts: [
      'birthday-plots-disclose-isp.trycloudflare.com',
      '.trycloudflare.com', // Allow all Cloudflare tunnel domains
    ],
    proxy: {
      '/api': {
        target: 'http://13.206.177.63:8000/' , //'http://localhost:8000/'
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
