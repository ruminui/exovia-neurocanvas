import { spawn } from 'node:child_process';
import process from 'node:process';

const HOST = process.env.EXOVIA_WEB_HOST || '127.0.0.1';
const PORT = Number(process.env.EXOVIA_WEB_PORT || 8080);
const URL = `http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}`;

function openBrowser(url) {
  const platform = process.platform;
  const command = platform === 'win32' ? 'cmd' : platform === 'darwin' ? 'open' : 'xdg-open';
  const args = platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const opener = spawn(command, args, { detached: true, stdio: 'ignore' });
  opener.on('error', () => {
    console.log(`Open this address manually: ${url}`);
  });
  opener.unref();
}

console.log('');
console.log('==============================================');
console.log(' EXOVIA NEUROCANVAS');
console.log(' Local-first visual knowledge workspace');
console.log('==============================================');
console.log('');
console.log(`Starting at ${URL}`);
console.log('Keep this window open while using the app.');
console.log('Press Ctrl+C to stop.');
console.log('');

const server = spawn(process.execPath, ['scripts/serve.mjs'], {
  stdio: 'inherit',
  env: { ...process.env, HOST, PORT: String(PORT) }
});

let opened = false;
const timer = setTimeout(() => {
  opened = true;
  openBrowser(URL);
}, 900);

function shutdown(signal) {
  clearTimeout(timer);
  if (!server.killed) server.kill(signal === 'SIGINT' ? 'SIGINT' : 'SIGTERM');
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

server.on('exit', code => {
  clearTimeout(timer);
  if (!opened && code === 0) openBrowser(URL);
  process.exitCode = code ?? 0;
});
