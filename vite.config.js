import { execSync } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Versión que se muestra al fondo del Perfil: fecha del despliegue (hora de Silao) y commit corto. Sale sola:
// Cloudflare Pages entrega el commit en CF_PAGES_COMMIT_SHA; en tu compu se pregunta a git.
function commitShort() {
  const fromCloudflare = process.env.CF_PAGES_COMMIT_SHA;
  if (fromCloudflare) return fromCloudflare.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'dev';
  }
}

function buildDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return parts.replaceAll('-', '.'); // 2026.10.25
}

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(`v${buildDate()} · ${commitShort()}`),
  },
  server: {
    port: 5173,
  },
});
