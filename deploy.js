/**
 * School Management System Deployment Script
 * 
 * This script prepares the application for production deployment.
 * It installs dependencies, builds the frontend, and sets up the backend.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Helper function to execute shell commands
function executeCommand(command, directory = '.') {
  try {
    console.log(`${colors.cyan}> ${command}${colors.reset}`);
    execSync(command, { 
      cwd: directory, 
      stdio: 'inherit',
      shell: true
    });
    return true;
  } catch (error) {
    console.error(`${colors.red}Error executing command: ${command}${colors.reset}`);
    console.error(error.message);
    return false;
  }
}

// Helper function to log section headers
function logSection(title) {
  console.log(`\n${colors.bright}${colors.yellow}=== ${title} ===${colors.reset}\n`);
}

// Main deployment function
async function deploy() {
  try {
    logSection('Starting Deployment Process');
    
    // Install backend dependencies
    logSection('Installing Backend Dependencies');
    if (!executeCommand('npm install --production', 'backend')) {
      throw new Error('Failed to install backend dependencies');
    }
    
    // Install frontend dependencies
    logSection('Installing Frontend Dependencies');
    if (!executeCommand('npm install', 'frontend')) {
      throw new Error('Failed to install frontend dependencies');
    }
    
    // Build frontend
    logSection('Building Frontend');
    if (!executeCommand('npm run build', 'frontend')) {
      throw new Error('Failed to build frontend');
    }
    
    // Copy frontend build to backend public directory
    logSection('Copying Frontend Build to Backend');
    const backendPublicDir = path.join(__dirname, 'backend', 'public');
    
    // Create public directory if it doesn't exist
    if (!fs.existsSync(backendPublicDir)) {
      fs.mkdirSync(backendPublicDir, { recursive: true });
    }
    
    // Copy frontend build to backend public directory
    if (!executeCommand('xcopy /E /I /Y dist\\* ..\\backend\\public\\', 'frontend')) {
      throw new Error('Failed to copy frontend build to backend');
    }
    
    // Update server.js to serve static files
    logSection('Updating Server Configuration');
    const serverJsPath = path.join(__dirname, 'backend', 'server.js');
    let serverJs = fs.readFileSync(serverJsPath, 'utf8');
    
    // Check if static file serving is already configured
    if (!serverJs.includes('app.use(express.static(')) {
      // Add static file serving after the middleware section
      const staticServeCode = `
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public')));
`;
      
      // Insert the code after the middleware section
      serverJs = serverJs.replace(
        /app\.use\(morgan.*?\);(\r?\n)/,
        `app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));$1${staticServeCode}$1`
      );
      
      // Add catch-all route at the end
      const catchAllRoute = `
// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
`;
      
      // Insert the catch-all route before the error handler
      serverJs = serverJs.replace(
        /\/\/ Error handling middleware/,
        `${catchAllRoute}\n// Error handling middleware`
      );
      
      fs.writeFileSync(serverJsPath, serverJs);
      console.log(`${colors.green}Updated server.js to serve static files${colors.reset}`);
    } else {
      console.log(`${colors.yellow}Static file serving already configured in server.js${colors.reset}`);
    }
    
    logSection('Deployment Completed Successfully');
    console.log(`${colors.green}The application is now ready for production!${colors.reset}`);
    console.log(`${colors.cyan}To start the server, run: ${colors.reset}cd backend && npm start`);
    
  } catch (error) {
    console.error(`${colors.red}Deployment failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the deployment
deploy();
