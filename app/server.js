const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 8080;
const VERSION = process.env.APP_VERSION || '1.0.0';

const html = (scan) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>DevSecOps Demo</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 2rem 2.5rem; max-width: 560px; width: 100%; }
  h1 { font-size: 1.5rem; color: #58a6ff; margin-bottom: 0.25rem; }
  .sub { color: #8b949e; font-size: 0.9rem; margin-bottom: 2rem; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
  .stat { background: #0d1117; border: 1px solid #21262d; border-radius: 8px; padding: 0.9rem 1rem; }
  .stat-label { font-size: 0.75rem; color: #8b949e; text-transform: uppercase; letter-spacing: 0.05em; }
  .stat-value { font-size: 1.1rem; font-weight: 600; color: #e6edf3; margin-top: 0.2rem; }
  .pipeline { border-top: 1px solid #21262d; padding-top: 1.5rem; }
  .pipeline h2 { font-size: 0.85rem; color: #8b949e; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
  .step { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #21262d; }
  .step:last-child { border-bottom: none; }
  .badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; min-width: 60px; text-align: center; }
  .pass { background: #1a4731; color: #3fb950; }
  .info { background: #1c2a3a; color: #58a6ff; }
  .step-name { font-size: 0.9rem; flex: 1; }
  .step-detail { font-size: 0.8rem; color: #8b949e; }
</style>
</head>
<body>
<div class="card">
  <h1>🔐 DevSecOps Demo</h1>
  <p class="sub">Imagen firmada con Cosign · Escaneada con Trivy · Política Kyverno activa</p>
  <div class="grid">
    <div class="stat">
      <div class="stat-label">Versión</div>
      <div class="stat-value">${VERSION}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Host</div>
      <div class="stat-value">${os.hostname()}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Plataforma</div>
      <div class="stat-value">${os.platform()}/${os.arch()}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Uptime</div>
      <div class="stat-value">${Math.floor(process.uptime())}s</div>
    </div>
  </div>
  <div class="pipeline">
    <h2>Pipeline de seguridad</h2>
    ${scan.steps.map(s => `
    <div class="step">
      <span class="badge ${s.status === 'passed' ? 'pass' : 'info'}">${s.status === 'passed' ? '✓ PASS' : 'ℹ INFO'}</span>
      <span class="step-name">${s.name}</span>
      <span class="step-detail">${s.detail}</span>
    </div>`).join('')}
  </div>
</div>
</body>
</html>`;

const scanResults = {
  steps: [
    { name: 'Secrets Detection', detail: 'Gitleaks', status: 'passed' },
    { name: 'SAST', detail: 'Semgrep auto rules', status: 'passed' },
    { name: 'Container Scan', detail: 'Trivy · 0 CRITICAL', status: 'passed' },
    { name: 'Image Signing', detail: 'Cosign keyless · Sigstore', status: 'passed' },
    { name: 'Admission Control', detail: 'Kyverno policy enforced', status: 'passed' },
  ],
};

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', version: VERSION }));
    return;
  }
  if (req.url === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end([
      `# HELP app_info Application info`,
      `# TYPE app_info gauge`,
      `app_info{version="${VERSION}",hostname="${os.hostname()}"} 1`,
      `# HELP process_uptime_seconds Process uptime`,
      `# TYPE process_uptime_seconds gauge`,
      `process_uptime_seconds ${process.uptime().toFixed(2)}`,
    ].join('\n') + '\n');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html(scanResults));
});

server.listen(PORT, () => console.log(`devsecops-demo v${VERSION} listening on :${PORT}`));
