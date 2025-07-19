#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Debug logging function
const debug = (msg) => {
  const timestamp = new Date().toISOString();
  process.stderr.write(`[${timestamp}] DEBUG: ${msg}\n`);
};

debug('Wrapper script started');
debug(`Process argv: ${JSON.stringify(process.argv)}`);
debug(`Working directory: ${process.cwd()}`);
debug(`__dirname: ${__dirname}`);

// Platform detection
const platform = process.platform;
const arch = process.arch;

debug(`Platform: ${platform}, Architecture: ${arch}`);

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
  try {
    debug('Starting main function');
    
    const binaryName = getBinaryName();
    debug(`Binary name: ${binaryName}`);
    
    if (!binaryName) {
      debug(`Unsupported platform: ${platform}-${arch}`);
      process.stderr.write(`Unsupported platform: ${platform}-${arch}\n`);
      process.stderr.write('Supported platforms: linux-x64, darwin-x64, darwin-arm64, win32-x64\n');
      process.exit(1);
    }
    
    const binaryPath = path.join(__dirname, 'bin', binaryName);
    debug(`Binary path: ${binaryPath}`);
    
    // Check if binary directory exists
    const binDir = path.join(__dirname, 'bin');
    debug(`Checking bin directory: ${binDir}`);
    
    if (!fs.existsSync(binDir)) {
      debug(`Bin directory does not exist: ${binDir}`);
      process.stderr.write(`Bin directory not found: ${binDir}\n`);
      process.exit(1);
    }
    
    // List contents of bin directory
    try {
      const binContents = fs.readdirSync(binDir);
      debug(`Bin directory contents: ${JSON.stringify(binContents)}`);
    } catch (error) {
      debug(`Failed to read bin directory: ${error.message}`);
    }
    
    if (!fs.existsSync(binaryPath)) {
      debug(`Binary file does not exist: ${binaryPath}`);
      process.stderr.write(`Binary not found: ${binaryPath}\n`);
      process.stderr.write('Please ensure the binary is built for your platform.\n');
      process.exit(1);
    }
    
    // Check binary file permissions
    try {
      const stats = fs.statSync(binaryPath);
      debug(`Binary file stats: mode=${stats.mode.toString(8)}, size=${stats.size}`);
    } catch (error) {
      debug(`Failed to get binary stats: ${error.message}`);
    }
    
    // Make sure binary is executable (Unix systems)
    if (platform !== 'win32') {
      try {
        fs.chmodSync(binaryPath, 0o755);
        debug('Binary permissions set to executable');
      } catch (error) {
        debug(`Failed to make binary executable: ${error.message}`);
        process.stderr.write(`Failed to make binary executable: ${error.message}\n`);
      }
    }
    
    debug('Spawning binary process');
    debug(`Command: ${binaryPath}`);
    debug(`Args: ${JSON.stringify(process.argv.slice(2))}`);
    
    // Execute the binary
    const child = spawn(binaryPath, process.argv.slice(2), {
      stdio: 'inherit'
    });
    
    child.on('error', (error) => {
      debug(`Child process error: ${error.message}`);
      process.stderr.write(`Failed to start server: ${error.message}\n`);
      process.exit(1);
    });
    
    child.on('close', (code) => {
      debug(`Child process closed with code: ${code}`);
      process.exit(code || 0);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      debug('Received SIGINT, killing child process');
      child.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      debug('Received SIGTERM, killing child process');
      child.kill('SIGTERM');
    });
    
    debug('Wrapper setup complete');
    
  } catch (error) {
    debug(`Main function error: ${error.message}`);
    debug(`Stack trace: ${error.stack}`);
    process.stderr.write(`Wrapper error: ${error.message}\n`);
    process.exit(1);
  }
};

debug('Calling main function');
main();