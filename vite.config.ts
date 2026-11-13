import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const grupos: Record<string, string[]> = {
  react: ['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler', 'cookie', 'set-cookie-parser'],
  mui: ['@mui/', '@emotion/', '@popperjs/core', 'react-transition-group', 'stylis', 'react-is'],
  charts: [
    'recharts',
    'victory-vendor',
    'd3-',
    'decimal.js-light',
    'eventemitter3',
    'tiny-invariant',
    'es-toolkit',
    '@reduxjs/',
    'redux',
    'redux-thunk',
    'react-redux',
    'reselect',
    'immer',
    'use-sync-external-store',
  ],
};

function grupoDo(id: string): string | undefined {
  const caminho = id.replace(/\\/g, '/');
  const i = caminho.lastIndexOf('/node_modules/');
  if (i === -1) return undefined;
  const pacote = caminho.slice(i + '/node_modules/'.length);
  for (const [grupo, prefixos] of Object.entries(grupos)) {
    if (prefixos.some((p) => (p.endsWith('/') || p.endsWith('-') ? pacote.startsWith(p) : pacote.startsWith(p + '/'))))
      return grupo;
  }
  return undefined;
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks: grupoDo,
      },
    },
  },
});
