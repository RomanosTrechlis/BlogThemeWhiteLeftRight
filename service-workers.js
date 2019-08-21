var cacheName = 'rant-v1';

var cacheFiles = [
	'./',
	'./about/index.html',
	'./favicon.ico',
	'./beard_512.png',
	'./beard_192.png',
	'./manifest.json',
	'./google.min.css',
	'./index.html',
	'./index.xml',
	'./style.min.css',
	]

self.addEventListener('install', function(e) {
	console.log('[ServiceWorker] Installed');

	// e.waitUntil Delays the event until the Promise is resolved
	e.waitUntil(

		// Open the cache
		caches.open(cacheName).then(function(cache) {

			// Add all the default files to the cache
			console.log('[ServiceWorker] Caching cacheFiles');
			return cache.addAll(cacheFiles);
		})
	); // end e.waitUntil
});

self.addEventListener('activate', function(e) {
	console.log('[ServiceWorker] Activated');

	e.waitUntil(

		// Get all the cache keys (cacheName)
		caches.keys().then(function(cacheNames) {
			return Promise.all(cacheNames.map(function(thisCacheName) {

				// If a cached item is saved under a previous cacheName
				if (thisCacheName !== cacheName) {

					// Delete that cached file
					console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
					return caches.delete(thisCacheName);
				}
			}));
		})
	); // end e.waitUntil
});

self.addEventListener('fetch', function (e) {
	console.log('[ServiceWorker] Fetch', e.request.url);
    e.respondWith(
        caches.match(e.request).then(function(response){
            return response || requestBackend(e);
        })
    )
});

function requestBackend(event){
    var url = event.request.clone();
    return fetch(url).then(function(res){
        //if not a valid response send the error
        if(!res || res.status !== 200 || res.type !== 'basic'){
            return res;
        }

        var response = res.clone();

        caches.open(cacheName).then(function(cache){
            cache.put(event.request, response);
            console.log('[ServiceWorker] New Data Cached', e.request.url);
        });

        return res;
    })
}


