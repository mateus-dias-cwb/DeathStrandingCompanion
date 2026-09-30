import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import type { Plugin, OutputBundle } from 'vite';
import react from '@vitejs/plugin-react';

const serviceWorkerPlugin: Plugin = {
  name: 'bridge-planner-service-worker',
  apply: 'build',
  generateBundle(_options, bundle: OutputBundle) {
    const files = Object.values(bundle).filter((output) => output.fileName !== 'sw.js');
    const hash = createHash('sha256');

    for (const output of files) {
      hash.update(output.fileName);
      hash.update(output.type === 'chunk' ? output.code : output.source);
    }

    const precacheFiles = [
      ...files.map(({ fileName }) => `./${fileName}`),
      './manifest.webmanifest',
      './icons/bridge-planner.svg',
      './icons/bridge-planner-180.png',
      './icons/bridge-planner-192.png',
      './icons/bridge-planner-512.png',
    ];
    const cacheName = `bridge-planner-shell-${hash.digest('hex').slice(0, 12)}`;
    const serviceWorkerPath = resolve(process.cwd(), 'dist', 'sw.js');
    const serviceWorker = readFileSync(resolve(process.cwd(), 'public', 'sw.js'), 'utf8')
      .replace("const CACHE_NAME = 'bridge-planner-shell-v2';", `const CACHE_NAME = '${cacheName}';`)
      .replace('const PRECACHE_BUILD_ASSETS = [];', `const PRECACHE_BUILD_ASSETS = ${JSON.stringify(precacheFiles)};`);

    writeFileSync(serviceWorkerPath, serviceWorker);
  },
};

export default defineConfig(({ command }) => ({
  plugins: [react(), serviceWorkerPlugin],
  base: command === 'build' ? '/DeathStrandingCompanion/' : '/',
}));
