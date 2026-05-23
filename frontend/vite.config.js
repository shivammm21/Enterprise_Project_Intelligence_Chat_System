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
        target: 'https://princess-hip-acres-assembly.trycloudflare.com/', //http://localhost:8000/
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
