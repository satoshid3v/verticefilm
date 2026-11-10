// Build verification and compression script for Cloudflare Pages
// Desarrollado por Vertice Codeium

import { existsSync, statSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

console.log('[Vertice Codeium] Validating and preparing distribution bundle for Cloudflare Pages...');

const distDir = resolve(process.cwd(), 'dist');
const rawWasmPath = resolve(distDir, 'filmcraft_web_bg.wasm');
const gzWasmPath = resolve(distDir, 'filmcraft_web_bg.wasm.gz');

// 1. Manejo de compresión WASM para el límite estricto de 25 MiB de Cloudflare Pages
if (existsSync(rawWasmPath)) {
  console.log('[Vertice Codeium] Detected uncompressed wasm. Compressing to gzip format...');
  const rawBytes = readFileSync(rawWasmPath);
  const gzBytes = gzipSync(rawBytes, { level: 9 });
  writeFileSync(gzWasmPath, gzBytes);
  console.log(`[Vertice Codeium] Compressed wasm: ${(rawBytes.length / (1024 * 1024)).toFixed(2)} MB -> ${(gzBytes.length / (1024 * 1024)).toFixed(2)} MB`);
  
  // Eliminar el wasm sin comprimir para no superar el límite de 25 MiB de Cloudflare Pages
  unlinkSync(rawWasmPath);
  console.log('[Vertice Codeium] Removed uncompressed wasm to comply with Cloudflare Pages 25 MiB asset limit.');
}

const requiredFiles = [
  'dist/index.html',
  'dist/editor.html',
  'dist/filmcraft_web.js',
  'dist/filmcraft_web_bg.v2.wasm.gz',
  'dist/audio-worklet.js',
  'dist/brand-logo.svg',
  'dist/three.module.js',
  'dist/_headers',
  'dist/_routes.json'
];

let allValid = true;
const MAX_CLOUDFLARE_SIZE = 25 * 1024 * 1024; // 25 MiB

for (const file of requiredFiles) {
  const filePath = resolve(process.cwd(), file);
  if (!existsSync(filePath)) {
    console.error(`[Error] Missing essential distribution file: ${file}`);
    allValid = false;
  } else {
    const stats = statSync(filePath);
    if (stats.size > MAX_CLOUDFLARE_SIZE) {
      console.error(`[Error] File ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB) exceeds Cloudflare Pages limit of 25 MiB!`);
      allValid = false;
    }
  }
}

if (!allValid) {
  console.error('[Vertice Codeium] Build validation failed! Please resolve asset issues.');
  process.exit(1);
}

console.log('[Vertice Codeium] All distribution files validated successfully for Cloudflare Pages deployment (All files < 25 MiB).');
