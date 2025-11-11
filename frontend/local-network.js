import chalk from 'chalk';
import { networkInterfaces } from 'os';

// Get local IP addresses
function getLocalIPs() {
  const interfaces = networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  
  return addresses;
}

// Display local network access information
function displayNetworkInfo() {
  const port = 5173; // Vite's default port
  const ips = getLocalIPs();
  
  console.log(chalk.green('✓ Local development server running!'));
  console.log(chalk.blue('Access URLs:'));
  console.log(chalk.cyan(`Local: http://localhost:${port}`));
  
  if (ips.length > 0) {
    console.log(chalk.yellow('Network:'));
    ips.forEach(ip => {
      console.log(chalk.yellow(`  http://${ip}:${port}`));
    });
    
    console.log('');
    console.log(chalk.magenta('Share these URLs with devices on your local network'));
    console.log(chalk.magenta('Note: Both devices must be on the same network'));
  } else {
    console.log(chalk.red('No network interfaces found for sharing'));
  }
}

displayNetworkInfo();
