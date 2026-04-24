#!/usr/bin/env node
/**
 * PokéForge AI Art — Local Proxy
 * ===============================
 *
 * Tiny zero-dependency CORS-enabled proxy for the Anthropic Messages API.
 * Runs on http://localhost:3000 by default. The HTML file talks to this
 * instead of calling Anthropic directly — your API key stays on your machine.
 *
 * Setup:
 *   1. Install Node.js 18+ (it ships with `fetch` built-in).
 *   2. Put your key in an env var:
 *        Windows PowerShell:  $env:ANTHROPIC_API_KEY="sk-ant-..."
 *        Windows CMD:         set ANTHROPIC_API_KEY=sk-ant-...
 *        macOS/Linux:         export ANTHROPIC_API_KEY=sk-ant-...
 *   3. Run it:
 *        node pokeforge-proxy.js
 *   4. Open pokeforge.html in your browser, click ⚙ AI SETTINGS,
 *      set backend to AUTO or PROXY, save.
 *   5. Click 🎨 GENERATE AI ART.
 *
 * Change the port with:  PORT=4000 node pokeforge-proxy.js
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const KEY = process.env.ANTHROPIC_API_KEY;

if (!KEY) {
  console.error('\n❌ ANTHROPIC_API_KEY env var is not set.\n');
  console.error('Example (macOS/Linux):  export ANTHROPIC_API_KEY=sk-ant-...');
  console.error('Example (PowerShell):   $env:ANTHROPIC_API_KEY="sk-ant-..."');
  console.error('Then re-run: node pokeforge-proxy.js\n');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  // CORS for any origin — this is a local dev tool, not a public service
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`PokéForge proxy is running.\nPOST JSON to /v1/messages — it'll be forwarded to Anthropic.\n`);
    return;
  }

  if (req.method !== 'POST' || !req.url.startsWith('/v1/messages')) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found. POST to /v1/messages.');
    return;
  }

  // Collect body
  let body = '';
  req.on('data', chunk => { body += chunk; if (body.length > 1_000_000) req.destroy(); });
  req.on('end', async () => {
    console.log(`[${new Date().toISOString()}] POST /v1/messages (${body.length} bytes)`);
    try {
      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': KEY,
          'anthropic-version': '2023-06-01',
        },
        body,
      });
      const text = await upstream.text();
      console.log(`  → ${upstream.status} ${upstream.statusText} (${text.length} bytes)`);
      res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
      res.end(text);
    } catch (e) {
      console.error('  → upstream error:', e.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ type: 'error', error: { type: 'proxy_error', message: e.message } }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🎨 PokéForge proxy listening on http://localhost:${PORT}`);
  console.log(`   API key: …${KEY.slice(-8)}`);
  console.log(`   Forwarding /v1/messages → https://api.anthropic.com/v1/messages`);
  console.log(`   Open pokeforge.html, make sure proxy URL matches in ⚙ AI SETTINGS.\n`);
});
