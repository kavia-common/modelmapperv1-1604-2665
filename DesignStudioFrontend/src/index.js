import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles.css';
import './components/forms.css';
import './components/pages.css';
import App from './App';

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log environment info
const bypassAuth = String(process.env.REACT_APP_BYPASS_AUTH).toLowerCase() === 'true';
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Auth bypass: ${bypassAuth ? 'enabled' : 'disabled'}`);
