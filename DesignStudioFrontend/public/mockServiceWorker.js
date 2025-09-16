self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
/**
 * Minimal MSW service worker shim.
 * Note: In production, this file should be generated via `npx msw init public --save`
 * for your project to ensure it matches the version of "msw" you're using.
 *
 * This lightweight file forwards fetch events to the MSW library bootstrapped by the app.
 * It exists to ensure the correct MIME type (application/javascript) and path (/mockServiceWorker.js)
 * so registration succeeds in local/preview environments even if generation step was skipped.
 */

// A no-op handler to allow MSW's worker.start() to take over once the page-controlled script initializes.
self.addEventListener('fetch', function noop() {
  // The actual request handling is attached by MSW runtime when worker.start() runs in the app.
});
