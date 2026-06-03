const CACHE = 'assistant-professeur-v1';
const URL_TO_CACHE = './assistant_professeur.html';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      // نحمّل كان الـ HTML — بلا ./ باش ما يفشلش
      return cache.add(URL_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // كان الـ HTML — network first، وإذا فشل نرجع من cache
  if(e.request.mode === 'navigate' || e.request.url.includes('assistant_professeur.html')){
    e.respondWith(
      fetch(e.request)
        .then(function(response) {
          // نحفظ النسخة الجديدة في cache
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return response;
        })
        .catch(function() {
          // بلا نت — نرجع من cache
          return caches.match(URL_TO_CACHE);
        })
    );
  }
});
