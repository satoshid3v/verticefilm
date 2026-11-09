// Build verification script for Cloudflare Pages
// Desarrollado por Vertice Codeium

import { existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('[Vertice Codeium] Validating and preparing distribution bundle for Cloudflare Pages...');

const requiredFiles = [
  'dist/index.html',
  'dist/editor.html',
  'dist/filmcraft_web.js',
  'dist/filmcraft_web_bg.wasm',
  'dist/audio-worklet.js',
  'dist/brand-logo.svg',
  'dist/three.module.js',
  'dist/_headers',
  'dist/_routes.json'
];

let allValid = true;
for (const file of requiredFiles) {
  if (!existsSync(resolve(process.cwd(), file))) {
    console.error(`[Error] Missing essential distribution file: ${file}`);
    allValid = false;
  }
}

if (!allValid) {
  console.error('[Vertice Codeium] Build validation failed! Please check missing files.');
  process.exit(1);
}

console.log('[Vertice Codeium] All distribution files validated successfully for Cloudflare Pages deployment.');
