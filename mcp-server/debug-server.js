#!/usr/bin/env node

// Debug version of MCP server that logs everything to stderr
const fs = require('fs');
const path = require('path');

const debug = (msg) => {
  const timestamp = new Date().toISOString();
  fs.writeFileSync('/tmp/mcp-debug.log', `${timestamp}: ${msg}\n`, { flag: 'a' });
  process.stderr.write(`[DEBUG] ${msg}\n`);
};

debug('Starting debug MCP server');
debug(`Process args: ${JSON.stringify(process.argv)}`);
debug(`Working directory: ${process.cwd()}`);
debug(`Node version: ${process.version}`);

// Check if Deno exists
const { spawn } = require('child_process');

const checkDeno = () => {
  return new Promise((resolve) => {
    debug('Checking for Deno...');
    const denoCheck = spawn('deno', ['--version']);
    
    denoCheck.stdout.on('data', (data) => {
      debug(`Deno stdout: ${data}`);
    });
    
    denoCheck.stderr.on('data', (data) => {
      debug(`Deno stderr: ${data}`);
    });
    
    denoCheck.on('close', (code) => {
      debug(`Deno check exited with code: ${code}`);
      resolve(code === 0);
    });
    
    denoCheck.on('error', (error) => {
      debug(`Deno check error: ${error.message}`);
      resolve(false);
    });
  });
};

const main = async () => {
  try {
    debug('Main function started');
    
    const hasDeno = await checkDeno();
    debug(`Deno available: ${hasDeno}`);
    
    if (!hasDeno) {
      debug('Deno not found, exiting');
      process.stderr.write('Error: Deno is not installed.\n');
      process.stderr.write('Please install Deno first: https://deno.land/#installation\n');
      process.exit(1);
    }

    // Try to find main.ts
    const possiblePaths = [
      path.join(__dirname, '..', 'main.ts'),
      path.join(__dirname, 'main.ts'),
      path.join(process.cwd(), 'main.ts'),
    ];
    
    let mainTsPath = null;
    for (const p of possiblePaths) {
      debug(`Checking path: ${p}`);
      if (fs.existsSync(p)) {
        mainTsPath = p;
        debug(`Found main.ts at: ${p}`);
        break;
      }
    }
    
    if (!mainTsPath) {
      debug('main.ts not found in any expected location');
      process.stderr.write('Error: main.ts not found\n');
      process.exit(1);
    }
    
    debug(`Starting Deno with: deno run --allow-run --allow-read ${mainTsPath}`);
    
    // Start the Deno MCP server
    const server = spawn('deno', ['run', '--allow-run', '--allow-read', mainTsPath], {
      stdio: ['inherit', 'inherit', 'pipe']
    });

    if (server.stderr) {
      server.stderr.on('data', (data) => {
        debug(`Deno stderr: ${data}`);
        process.stderr.write(data);
      });
    }

    server.on('error', (error) => {
      debug(`Server spawn error: ${error.message}`);
      process.stderr.write(`Server spawn error: ${error.message}\n`);
      process.exit(1);
    });

    server.on('close', (code) => {
      debug(`Server exited with code: ${code}`);
      if (code !== 0) {
        process.stderr.write(`Server exited with code ${code}\n`);
      }
      process.exit(code || 0);
    });
    
    debug('Server started successfully');
    
  } catch (error) {
    debug(`Startup error: ${error.message}`);
    process.stderr.write(`Startup error: ${error.message}\n`);
    process.exit(1);
  }
};

main().catch((error) => {
  debug(`Unhandled error: ${error.message}`);
  process.stderr.write(`Error starting MCP server: ${error}\n`);
  process.exit(1);
});