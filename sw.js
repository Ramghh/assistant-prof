const CACHE_NAME = 'assistant-professeur-v3';
const HTML_FILE = './index.html';

// عند التثبيت — نحمّل الـ HTML في الـ cache
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.add(HTML_FILE);
    }).catch(function(err) {
      console.log('Cache install failed:', err);
    })
  );
  self.skipWaiting();
});

// عند التفعيل — نمسح الـ cache القديم
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// عند كل fetch — network first ثم cache
self.addEventListener('fetch', function(e) {
  if(e.request.method !== 'GET') return;
  
  e.respondWith(
    fetch(e.request.clone())
      .then(function(response) {
        // إذا الرد صحيح — نحفظه في cache ونرجعو
        if(response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        // بلا نت — نرجع من cache
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match(HTML_FILE);
        });
      })
  );
});
