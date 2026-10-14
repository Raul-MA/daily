import { spawn } from 'node:child_process';

export async function withBrowserServer(run) {
  if (process.env.TONIQ_URL) return run();
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '8766', '--strictPort'], { stdio: 'inherit' });
  try {
    await ready(server);
    return run();
  } finally {
    server.kill('SIGTERM');
  }
}

async function ready(server) {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) throw new Error('Test server exited before readiness');
    try {
      const response = await fetch('http://127.0.0.1:8766/daily/');
      if (response.ok) return;
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Test server did not become ready');
}
