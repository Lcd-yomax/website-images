import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  publicDir: 'unmatched_images',
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    {
      name: 'serve-special-chars',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // If the original URL contains encoded special chars that Vite misses
          if (req.originalUrl.includes('%23') || req.originalUrl.includes('%2B')) {
            try {
              const decodedPath = decodeURIComponent(req.originalUrl.split('?')[0]);
              const filePath = path.join(process.cwd(), 'unmatched_images', decodedPath.slice(1));
              
              if (fs.existsSync(filePath)) {
                // Determine content type based on extension
                const ext = path.extname(filePath).toLowerCase();
                const mimeTypes = {
                  '.png': 'image/png',
                  '.jpg': 'image/jpeg',
                  '.jpeg': 'image/jpeg',
                  '.gif': 'image/gif',
                  '.svg': 'image/svg+xml',
                  '.webp': 'image/webp'
                };
                
                res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
                res.setHeader('Cache-Control', 'no-cache');
                const stream = fs.createReadStream(filePath);
                stream.pipe(res);
                return; // End response
              }
            } catch (e) {
              console.error('Error serving special file:', e);
            }
          }
          next();
        });
      }
    }
  ],
  build: {
    outDir: 'dist'
  }
});
