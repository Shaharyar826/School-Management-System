import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Try to load specific ngrok domain if available
let specificNgrokDomain = null;
try {
  const ngrokDomainPath = path.resolve('./src/ngrok-domain.js');
  if (fs.existsSync(ngrokDomainPath)) {
    // Extract domain from the file using regex to avoid import issues
    const content = fs.readFileSync(ngrokDomainPath, 'utf8');
    const match = content.match(/NGROK_DOMAIN = "([^"]+)"/);
    if (match && match[1]) {
      specificNgrokDomain = match[1];
      console.log(`Found specific ngrok domain: ${specificNgrokDomain}`);
    }
  }
} catch (error) {
  console.error('Error loading ngrok domain:', error);
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  // Allow localtunnel, ngrok and other hosts
  const allowedHosts = [
    'localhost',
    'schoollms.loca.lt',
    '0.0.0.0',
    '.loca.lt',
    '.ngrok-free.app', // Allow all ngrok free domains
    '.ngrok.io',       // Allow all ngrok domains (older format)
  ];

  // Add specific ngrok domain if available
  if (specificNgrokDomain) {
    allowedHosts.push(specificNgrokDomain);
    console.log(`Added specific ngrok domain to allowed hosts: ${specificNgrokDomain}`);
  }

  // Add the specific domain from the error message
  allowedHosts.push('1eb8-182-190-210-74.ngrok-free.app');

  return {
    plugins: [react()],
    server: {
      // Enable this to expose the server to your network
      host: '0.0.0.0',

      // Detect if we're running with a tunnel
      hmr: process.env.USE_TUNNEL === 'true' ? false : {
        // When not using a tunnel, use standard HMR
        host: null, // Use default host
        port: null, // Use default port
      },

      cors: true,

      // Optimize for performance
      fs: {
        strict: false, // Improves performance with tunnels
      },

      // Increase timeout for slow connections
      watch: {
        usePolling: true,
        interval: 1000,
      },
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
        '/uploads': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
        },
      },
      allowedHosts,
    },
    build: {
      // Production optimizations
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@headlessui/react', 'react-icons', 'react-toastify'],
            charts: ['chart.js', 'react-chartjs-2'],
            pdf: ['jspdf', 'pdfjs-dist'],
          },
        },
      },
      // Generate sourcemaps for production
      sourcemap: !isProduction,
    },
  }
})
