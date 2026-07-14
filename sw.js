const CACHE_NAME = 'libretto-canti-cache-v2';

// 1. Quando l'app viene installata sul telefono, memorizza la pagina principale
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Dice al telefono di salvare subito il file principale
            return cache.addAll(['./', './index.html']);
        }).then(() => self.skipWaiting())
    );
});

// 2. Quando il Service Worker si attiva, prende il controllo dell'app
self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim());
});

// 3. Quando l'app chiede una pagina, prova a scaricarla da internet.
// Se internet non c'è (offline), la prende all'istante dalla memoria del telefono (cache).
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((response) => {
                // Se internet funziona, salva una copia aggiornata nella cache
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Se internet è ASSENTE, legge dalla memoria
                return caches.match(e.request) || caches.match('.') || caches.match('./index.html');
            })
    );
});