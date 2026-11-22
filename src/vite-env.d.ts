/// <reference types="vite/client" />

// CSS da fonte (import só pelo efeito). Só a Inter precisa: a versão 5.2.8 não traz tipos; a Baloo 2 e a
// Caveat (5.3.0) já trazem `"types": "index.d.css.ts"` no package.json.
declare module '@fontsource-variable/inter';
