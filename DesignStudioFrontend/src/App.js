import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles.css';
import './components/forms.css';
import './components/pages.css';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ModelsPage from './pages/ModelsPage';
import ModelDetails from './pages/ModelDetails';
import RolesPage from './pages/RolesPage';
import MappingsPage from './pages/MappingsPage';
import CollaborationPage from './pages/CollaborationPage';
import DevicePage from './pages/DevicePage';
import MapperStudioPage from './pages/MapperStudioPage';
import { getUser, handleRedirectCallback, isBypassMode, signIn, signOut } from './services/auth';
import { worker } from './mocks/browser';

// Initialize MSW worker if in bypass mode
if (isBypassMode()) {
  worker.start();
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="container loading-container">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(getUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Handle OAuth redirect callback
    const params = new URLSearchParams(window.location.search);
    if (params.has('code')) {
      setIsLoading(true);
      handleRedirectCallback(params).then(success => {
        if (success) setUser(getUser());
        setIsLoading(false);
      });
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSignIn = () => {
    setIsLoading(true);
    signIn().then(() => {
      setUser(getUser());
      setIsLoading(false);
    });
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
  };

  // Show development warning when bypass is enabled
  useEffect(() => {
    if (isBypassMode()) {
      console.warn(
        '%cAuthentication Bypass Active',
        'background: #ff9800; color: #000; padding: 2px 4px; border-radius: 2px; font-weight: bold;',
        '\nRunning in development mode with mock authentication.',
        '\nDo not use in production!'
      );
    }
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="App">
          {isBypassMode() && (
            <div className="bypass-banner">
              Development Mode - Authentication Bypass Enabled
            </div>
          )}
          <Navbar 
            user={user}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            theme={theme}
            onToggleTheme={toggleTheme}
            bypass={isBypassMode()}
          />
          {isLoading ? (
            <LoadingFallback />
          ) : (user || isBypassMode()) ? (
            <div className="app-container">
              <main className="main-content">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/models" element={<ModelsPage />} />
                    <Route path="/models/:id" element={<ModelDetails />} />
                    <Route path="/roles" element={<RolesPage />} />
                    <Route path="/mappings" element={<MappingsPage />} />
                    <Route path="/collaboration" element={<CollaborationPage />} />
                    <Route path="/device" element={<DevicePage />} />
                    <Route path="/mapper" element={<MapperStudioPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          ) : (
            <div className="container">
              <h2>Please sign in to continue</h2>
              <button className="btn" onClick={handleSignIn} disabled={isLoading}>
                {isLoading ? <span className="spinner"></span> : 'Sign In'}
              </button>
              {isBypassMode() && (
                <p className="note">Auth bypass enabled. Click Sign In to use mock authentication.</p>
              )}
            </div>
          )}
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
