const CACHE_NAME = 'gridforge-static-v8'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/gridforge-mark.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const appResponse = await fetch('/')
      const documentText = await appResponse.clone().text()
      const assetPaths = [...documentText.matchAll(/(?:src|href)="([^"]+)"/g)]
        .map((match) => match[1])
        .filter((path) => path.startsWith('/assets/'))
      await cache.put('/', appResponse)
      await cache.addAll([...APP_SHELL.filter((path) => path !== '/'), ...assetPaths])
    }),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
        return response
      })
    }),
  )
})
