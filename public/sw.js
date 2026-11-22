/*
 * Service worker do casa (PWA). Só guarda a casca do app: o HTML (rede primeiro, cópia para abrir sem internet)
 * e os arquivos de /assets (nomes com hash, nunca mudam). Nada da API (/casa-api) passa por aqui:
 * dados e fotos vêm sempre da rede, com o login de quem está usando.
 * Os assets ficam num cache à parte, limitado a MAX_ASSETS entradas: a cada deploy chegam arquivos com hash novo e
 * os mais antigos saem sozinhos (o Cache Storage devolve as chaves na ordem em que foram guardadas).
 */
const CACHE = 'casa-v2';
const ASSETS = 'casa-assets-v1';
const MAX_ASSETS = 80;
const CACHES_ATUAIS = [CACHE, ASSETS];

function guardarAsset(req, res) {
  return caches.open(ASSETS).then((c) =>
    c
      .put(req, res)
      .then(() => c.keys())
      .then((chaves) => Promise.all(chaves.slice(0, Math.max(0, chaves.length - MAX_ASSETS)).map((k) => c.delete(k)))),
  );
}
const CASCA = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CASCA)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => !CACHES_ATUAIS.includes(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/casa-api')) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put('/', copia));
          }
          return res;
        })
        .catch(() => caches.match('/').then((r) => r || Response.error())),
    );
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(req).then(
        (r) =>
          r ||
          fetch(req).then((res) => {
            if (res.ok) e.waitUntil(guardarAsset(req, res.clone()));
            return res;
          }),
      ),
    );
  }
});
