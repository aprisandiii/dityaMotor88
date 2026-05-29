/* ══════════════════════════════════════════
   MotoKas — Service Worker v4.1
   Perbaikan:
   - Tambah js/aktivasi.js & js/firebase.js ke LOCAL_ASSETS
   - Tambah background sync helper untuk transaksi offline
══════════════════════════════════════════ */
const CACHE_NAME = 'dm88-v4.1';
const LOCAL_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/aktivasi.js',   // FIX: ditambahkan agar offline tetap jalan
  './js/firebase.js',   // FIX: ditambahkan agar offline tetap jalan
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
const EXTERNAL_DOMAINS = [
  'firebaseapp.com',
  'firebasedatabase.app',
  'googleapis.com',
  'gstatic.com',
  'jsdelivr.net',
  'cdnjs.cloudflare.com',
  'sheetjs.com',
  'sweetalert2'
];

// ── INSTALL: cache semua aset lokal ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        LOCAL_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Gagal cache:', url, err))
        )
      )
    )
  );
  self.skipWaiting();
});

// ── ACTIVATE: hapus cache lama ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Hapus cache lama:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: network-first, cache sebagai fallback ──
self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (e.request.method !== 'GET') return;

  const isExternal = EXTERNAL_DOMAINS.some(domain => url.includes(domain));
  if (isExternal) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response('', { status: 503, statusText: 'Service Unavailable' })
      )
    );
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (
          response &&
          response.status === 200 &&
          (response.type === 'basic' || response.type === 'cors')
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', {
            status: 503,
            statusText: 'Offline - Resource not cached'
          });
        });
      })
  );
});

// ── BACKGROUND SYNC: kirim transaksi pending saat online kembali ──
self.addEventListener('sync', e => {
  if (e.tag === 'sync-transaksi') {
    e.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SYNC_PENDING_TRX' });
        });
      })
    );
  }
});

// ── MESSAGE: terima perintah dari halaman utama ──
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
