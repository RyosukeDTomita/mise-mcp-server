#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Platform detection
const platform = process.platform;
const arch = process.arch;

const getBinaryName = () => {
  switch (platform) {
    case 'linux':
      return arch === 'x64' ? 'mise-mcp-server-linux-x64' : null;
    case 'darwin':
      return arch === 'x64' ? 'mise-mcp-server-darwin-x64' : 
             arch === 'arm64' ? 'mise-mcp-server-darwin-arm64' : null;
    case 'win32':
      return arch === 'x64' ? 'mise-mcp-server-win-x64.exe' : null;
    default:
      return null;
  }
};

const main = () => {
  const binaryName = getBinaryName();
  
  if (!binaryName) {
    console.error(`Unsupported platform: ${platform}-${arch}`);
    console.error('Supported platforms: linux-x64, darwin-x64, darwin-arm64, win32-x64');
    process.exit(1);
  }
  
  const binaryPath = path.join(__dirname, 'bin', binaryName);
  
  if (!fs.existsSync(binaryPath)) {
    console.error(`Binary not found: ${binaryPath}`);
    console.error('Please ensure the binary is built for your platform.');
    process.exit(1);
  }
  
  // Make sure binary is executable (Unix systems)
  if (platform !== 'win32') {
    try {
      fs.chmodSync(binaryPath, 0o755);
    } catch (error) {
      console.error(`Failed to make binary executable: ${error.message}`);
    }
  }
  
  // Execute the binary
  const child = spawn(binaryPath, process.argv.slice(2), {
    stdio: 'inherit'
  });
  
  child.on('error', (error) => {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  });
  
  child.on('close', (code) => {
    process.exit(code || 0);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
  });
};

main();