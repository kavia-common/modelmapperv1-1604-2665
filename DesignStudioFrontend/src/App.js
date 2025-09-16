import React, { useState, useEffect } from 'react';
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
import { getUser, handleRedirectCallback, isBypassMode, signIn, signOut } from './services/auth';
import { worker } from './mocks/browser';

// Initialize MSW worker if in bypass mode
if (isBypassMode()) {
  worker.start();
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Handle OAuth redirect callback
    const params = new URLSearchParams(window.location.search);
    if (params.has('code')) {
      handleRedirectCallback(params).then(success => {
        if (success) setUser(getUser());
      });
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSignIn = () => {
    signIn().then(() => setUser(getUser()));
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
  };

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="App">
        <Navbar 
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          theme={theme}
          onToggleTheme={toggleTheme}
          bypass={isBypassMode()}
        />
        {user ? (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/models" element={<ModelsPage />} />
            <Route path="/models/:id" element={<ModelDetails />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/mappings" element={<MappingsPage />} />
            <Route path="/collaboration" element={<CollaborationPage />} />
            <Route path="/device" element={<DevicePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <div className="container">
            <h2>Please sign in to continue</h2>
            <button className="btn" onClick={handleSignIn}>Sign In</button>
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
