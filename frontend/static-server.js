import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = 5173;
const PUBLIC_DIR = join(__dirname, 'dist');

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.txt': 'text/plain',
};

// Check if the dist directory exists
if (!existsSync(PUBLIC_DIR)) {
  console.error(chalk.red('Error: The "dist" directory does not exist.'));
  console.error(chalk.yellow('Please run "npm run build" first to create a production build.'));
  process.exit(1);
}

// Create a simple HTTP server
const server = createServer((req, res) => {
  console.log(`${chalk.blue(req.method)} ${req.url}`);

  // Parse the URL
  let filePath = join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);

  // If the path doesn't have an extension, assume it's a route and serve index.html
  if (!extname(filePath)) {
    filePath = join(PUBLIC_DIR, 'index.html');
  }

  // Get the file extension
  const ext = extname(filePath);

  // Set the content type based on the file extension
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Read the file
  try {
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  } catch (error) {
    // If the file doesn't exist, serve index.html (for SPA routing)
    if (error.code === 'ENOENT') {
      try {
        const content = readFileSync(join(PUBLIC_DIR, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      } catch (err) {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(500);
      res.end(`Server Error: ${error.code}`);
    }
  }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(chalk.green(`✓ Static server running at http://localhost:${PORT}`));
  console.log(chalk.cyan('This server is serving your production build without HMR'));
  console.log(chalk.cyan('It should work reliably with tunneling services'));
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(chalk.red(`Error: Port ${PORT} is already in use.`));
    console.error(chalk.yellow('Please close the other application or use a different port.'));
  } else {
    console.error(chalk.red(`Server error: ${error.message}`));
  }
  process.exit(1);
});
