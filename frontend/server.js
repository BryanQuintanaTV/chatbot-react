import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist directory with correct MIME types
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filepath) => {
    // Set correct MIME types
    if (filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filepath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else if (filepath.endsWith('.webmanifest') || filepath.endsWith('manifest.json')) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    } else if (filepath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Cache control
    if (filepath.endsWith('sw.js')) {
      // No cache for service worker
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filepath.endsWith('.html')) {
      // No cache for HTML - critical for maintenance mode changes
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filepath.match(/\.(js|jsx)$/)) {
      // JS files: cache but revalidate (allows updates to propagate)
      // If filename has hash (vite builds), use long cache
      // Otherwise, use short cache with revalidation
      if (filepath.match(/\.[a-f0-9]{8,}\.(js|jsx)$/)) {
        // Hashed files - long cache
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        // Non-hashed files - short cache with revalidation
        res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
      }
    } else if (filepath.match(/\.css$/)) {
      // CSS: similar strategy as JS
      if (filepath.match(/\.[a-f0-9]{8,}\.css$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
      }
    } else if (filepath.match(/\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot|webp)$/)) {
      // Static assets - long cache
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  // Set headers to prevent caching of index.html
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Serving from: ${path.join(__dirname, 'dist')}`);
});
