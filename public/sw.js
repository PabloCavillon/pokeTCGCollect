const CACHE = 'tcgdex-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys()
			.then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Only handle GET requests on the same origin
	if (request.method !== 'GET' || url.origin !== self.location.origin) return;

	// Network-only for API routes (always fresh data)
	if (url.pathname.startsWith('/api/')) return;

	// Stale-while-revalidate for everything else
	event.respondWith(
		caches.open(CACHE).then(cache =>
			cache.match(request).then(cached => {
				const fresh = fetch(request).then(response => {
					if (response.ok) cache.put(request, response.clone());
					return response;
				}).catch(() => cached);
				return cached ?? fresh;
			})
		)
	);
});
