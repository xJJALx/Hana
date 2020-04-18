const CACHE_STATIC = 'static-03-2020';
const CACHE_DYNAMIC = 'dynamic-03-2020';
const CACHE_INMUTABLE = 'inmutable-03-2020';

const CACHE_DYNAMIC_LIMIT = 50;

function limpiarCache(cacheName, numItems) {
    caches.open(cacheName)
        .then(cache => {
            return cache.keys()
                .then(keys => {
                    if (keys.length > numItems) {
                        cache.delete(keys[0])
                            .then(limpiarCache(cacheName, numItems));
                    }
                });
        });
}

self.addEventListener('install', e => {
    const cacheProm = caches.open(CACHE_STATIC)
        .then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/index.css',
                '/js/app.js',
                'icons/ajustes.svg',
                'icons/buscar.svg',
                'icons/calendario.svg',
                'icons/clima.svg',
                'icons/general.svg',
                'icons/lugares.svg',
                'icons/perfil.svg',
                'icons/planes.svg',
                'img/kda.jpg',
                'img/plumas.jpg'
            ]);
        });

    const cacheInmutable = caches.open(CACHE_INMUTABLE)
        .then(cache => cache.add('https://kit.fontawesome.com/3c16f4957b.js'));

    e.waitUntil(Promise.all([cacheProm, cacheInmutable]));
});


self.addEventListener('activate', e => {
    const respuesta = caches.keys().then(keys => {
        keys.forEach(key => {
            if (key !== CACHE_STATIC && key.includes('static')) {
                return caches.delete(key);
            }
        });
    });

    e.waitUntil(respuesta);
});


self.addEventListener('fetch', e => {
    // 2- Cache with Network Fallback
    const respuesta = caches.match(e.request)
        .then(res => {
            if (res) return res;

            // No existe el archivo
            return fetch(e.request).then(newResp => {
                caches.open(CACHE_DYNAMIC)
                    .then(cache => {
                        cache.put(e.request, newResp);
                        limpiarCache(CACHE_DYNAMIC, CACHE_DYNAMIC_LIMIT);
                    });

                return newResp.clone();
            })
                /******************* POR TERMINAR ********************/
                .catch(err => {
                    if (e.request.headers.get('accept').includes('text/html')) {
                        return caches.match('/pages/offline.html');
                    }
                });
        });

    e.respondWith(respuesta);
});