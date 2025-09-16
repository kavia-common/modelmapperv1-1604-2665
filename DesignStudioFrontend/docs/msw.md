# MSW (Mock Service Worker) Setup

This app uses MSW for local development and tests. The Service Worker script must be available at the app's public root, served as application/javascript, so the browser can register it.

## Files

- public/mockServiceWorker.js — The MSW worker script that the browser registers.

If you see an error like:
"[MSW] Failed to register the Service Worker: ... The script has an unsupported MIME type ('text/html')."
it typically means the worker file is missing, served from a wrong path, or returned as HTML (404 fallback).

## Generate or Update the Worker

Use the MSW CLI to generate/update the worker so it matches the MSW version:

```bash
# From DesignStudioFrontend directory
npx msw init public --save
```

This places the worker at public/mockServiceWorker.js.
Ensure your app registers it at the root path (default behavior of msw/browser with CRA).

## Starting in Mock Mode

```bash
npm run start:mock
```

This sets REACT_APP_BYPASS_AUTH=true and starts the app. The app will call `worker.start()` which registers `/mockServiceWorker.js`. Ensure the file exists in `public/` before starting.

## Notes

- If the worker registration fails with 404 or wrong MIME type, confirm:
  - The file exists at `DesignStudioFrontend/public/mockServiceWorker.js`
  - Your dev server is serving it at `/mockServiceWorker.js`
  - No custom proxy/rewrites interfere with `GET /mockServiceWorker.js`
- When upgrading `msw`, re-run the init command to regenerate the worker.
