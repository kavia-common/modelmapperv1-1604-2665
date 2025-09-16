# Authentication Bypass Mode

The Design Studio Frontend supports a development mode that bypasses OAuth authentication and uses mock data. This is useful for local development and testing without requiring a real backend or identity provider.

## Enabling Bypass Mode

There are two ways to enable bypass mode:

1. **Environment Variable**
   Set `REACT_APP_BYPASS_AUTH=true` in your `.env` file:
   ```
   REACT_APP_BYPASS_AUTH=true
   ```

2. **NPM Scripts**
   Use the provided mock scripts:
   ```bash
   # Start in mock mode
   npm run start:mock

   # Build in mock mode
   npm run build:mock

   # Test in mock mode
   npm run test:mock
   ```

## Features in Bypass Mode

When bypass mode is enabled:

- OAuth authentication flow is bypassed
- A mock user is automatically provided
- All API calls are intercepted by MSW (Mock Service Worker)
- Mock data is provided for all endpoints
- A "Bypass" indicator appears in the navbar
- Changes are stored in memory only

## Mock User Details

The mock user has the following properties:
```json
{
  "id": "dev-user-1",
  "name": "Dev User",
  "email": "dev.user@example.com",
  "roles": ["designer", "admin"]
}
```

## Mock Data

Mock data is provided for:
- Service models
- Roles
- Mappings
- Collaboration state
- Device connections

See `src/mocks/handlers.js` for the mock data implementation.

## API Client Configuration

The API client (`src/services/apiClient.js`) automatically detects bypass mode and routes requests through MSW when enabled. No additional configuration is needed.

## Disabling Bypass Mode

To disable bypass mode:
1. Set `REACT_APP_BYPASS_AUTH=false` in `.env`
2. Use regular npm scripts (`npm start`, `npm build`, `npm test`)
3. Configure OAuth environment variables for real authentication
