#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if Deno is installed
const checkDeno = () => {
  return new Promise((resolve) => {
    const denoCheck = spawn('deno', ['--version']);
    denoCheck.on('close', (code) => {
      resolve(code === 0);
    });
    denoCheck.on('error', () => {
      resolve(false);
    });
  });
};

const main = async () => {
  const hasDeno = await checkDeno();
  
  if (!hasDeno) {
    console.error('Error: Deno is not installed.');
    console.error('Please install Deno first: https://deno.land/#installation');
    process.exit(1);
  }

  // Path to the main.ts file
  const mainTsPath = join(__dirname, '..', 'main.ts');
  
  // Start the Deno MCP server
  const server = spawn('deno', ['run', '--allow-run', '--allow-read', mainTsPath], {
    stdio: 'inherit'
  });

  // Handle process termination
  process.on('SIGINT', () => {
    server.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    server.kill('SIGTERM');
    process.exit(0);
  });

  server.on('close', (code) => {
    process.exit(code || 0);
  });
};

main().catch((error) => {
  console.error('Error starting MCP server:', error);
  process.exit(1);
});