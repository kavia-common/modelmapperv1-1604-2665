# Design Studio Frontend

React-based frontend for the Design Studio application, providing a highly interactive web UI for service designers to model telco services and map them to vendor-specific YANG models.

## Features

- **Service Modeling**: Drag-and-drop interface for modeling telco services
- **Role Management**: Manage roles with dedicated sections
- **Mapping**: Graphical mapping between service models and YANG models
- **Mapper Studio**: Per-role JSON→XML visual mapper with drag-to-link, multi-XML support, device-YANG simulation, and jinja-style template preview/save
- **Collaboration**: Real-time collaborative editing
- **Device Integration**: Connect to devices for YANG model retrieval
- **Authentication**: OAuth integration with bypass mode for development
- **Theme Support**: Light and dark mode
- **Mock Mode**: Full API mocking for local development

## Getting Started

### Development Mode

For local development with mock data and bypassed authentication:

```bash
# Install dependencies
npm install

# Start in mock mode
npm run start:mock
```

### Production Mode

For production use with real backend and authentication:

1. Copy `.env.example` to `.env`
2. Configure environment variables
3. Run:
```bash
# Start with real backend and auth
npm start
```

## Available Scripts

All scripts support mock mode by adding `:mock` suffix:

### Development
- `npm start` - Runs app with real backend
- `npm start:mock` - Runs app with mock data
- `npm test` - Runs tests with real config
- `npm test:mock` - Runs tests with mocks
- `npm run build` - Builds for production
- `npm run build:mock` - Builds with mock config

## Authentication

The app supports two authentication modes:

### Production Mode
- OAuth 2.0 integration
- Configurable via environment variables:
  - `REACT_APP_OAUTH_AUTHORIZATION_URL`
  - `REACT_APP_OAUTH_CLIENT_ID`
  - `REACT_APP_OAUTH_REDIRECT_URI`
  - `REACT_APP_OAUTH_SCOPE`

### Development Mode (Bypass)
To enable authentication bypass:
1. Set `REACT_APP_BYPASS_AUTH=true` in `.env`
2. Or use `:mock` scripts (e.g. `npm run start:mock`)

Features in bypass mode:
- Automatic mock user login
- MSW intercepts API calls
- Mock data for all endpoints
- "Bypass" indicator in UI

See `docs/auth-bypass.md` for detailed documentation.

## API Integration

The app uses a flexible API client that supports:

- Real backend integration in production
- MSW for mocking in development
- Automatic mode detection
- OAuth token management
- Error handling and retries

Configuration via environment:
- `REACT_APP_API_BASE_URL` - Backend API URL
- `REACT_APP_BYPASS_AUTH` - Enable/disable mocking
- `REACT_APP_SITE_URL` - Site URL for redirects

## Features

### Service Modeling
- Create and edit service models
- Add and configure roles
- Define mappings
- Real-time validation

### Role Management
- Create and organize roles
- Group by sections
- Assign to models
- Manage permissions

### Mapping
- Map service models to YANG
- Visual mapping interface
- Validation and preview
- Export capabilities

### Collaboration
- Real-time updates
- Change tracking
- User presence
- Conflict resolution

### Device Integration
- Connect to network devices
- Retrieve YANG models
- Convert to visual format
- Test configurations

## Customization

### Theme

The app supports light and dark themes via CSS variables in `src/App.css`:

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #282c34;
  --text-secondary: #61dafb;
  --border-color: #e9ecef;
  --button-bg: #007bff;
  --button-text: #ffffff;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #282c34;
  --text-primary: #ffffff;
  --text-secondary: #61dafb;
  --border-color: #404040;
  --button-bg: #0056b3;
  --button-text: #ffffff;
}
```

### Components

The app uses custom components with pure CSS:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)
- Forms and inputs
- Lists and cards
- Status indicators

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## Learn More

- [React Documentation](https://reactjs.org/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [OAuth 2.0](https://oauth.net/2/)
- [YANG RFC](https://tools.ietf.org/html/rfc6020)
