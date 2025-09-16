import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { createApiClient } from '../services/apiClient';
import { getAccessToken } from '../services/auth';
import { logger } from '../services/logger';

const AppContext = createContext();

const initialState = {
  theme: 'light',
  loading: false,
  error: null,
  models: [],
  roles: [],
  mappings: [],
  collaboration: {
    activeUsers: 0,
    lastChangeId: 0
  }
};

function ensureArray(value) {
  // Defensive helper to normalize arrays coming from API or elsewhere
  return Array.isArray(value) ? value : (value ? [value] : []);
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_MODELS':
      return { ...state, models: ensureArray(action.payload) };
    case 'SET_ROLES':
      return { ...state, roles: ensureArray(action.payload) };
    case 'SET_MAPPINGS':
      return { ...state, mappings: ensureArray(action.payload) };
    case 'SET_COLLABORATION':
      return { ...state, collaboration: action.payload || { activeUsers: 0, lastChangeId: 0 } };
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const api = createApiClient(getAccessToken);
  logger.setApi(api);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [models, roles, mappings, collab] = await Promise.all([
          api.listModels(),
          api.listRoles(),
          api.listMappings(),
          api.getCollaboration()
        ]);
        dispatch({ type: 'SET_MODELS', payload: models });
        dispatch({ type: 'SET_ROLES', payload: roles });
        dispatch({ type: 'SET_MAPPINGS', payload: mappings });
        dispatch({ type: 'SET_COLLABORATION', payload: collab });
      } catch (error) {
        logger.error('Failed to load initial data:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadData();
  }, [api]);

  // Poll collaboration status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const collab = await api.getCollaboration();
        dispatch({ type: 'SET_COLLABORATION', payload: collab });
      } catch (error) {
        logger.error('Failed to update collaboration status:', error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [api]);

  const value = {
    state,
    dispatch,
    api,
    // Helper actions
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    refreshModels: async () => {
      try {
        const models = await api.listModels();
        dispatch({ type: 'SET_MODELS', payload: models });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },
    refreshRoles: async () => {
      try {
        const roles = await api.listRoles();
        dispatch({ type: 'SET_ROLES', payload: roles });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },
    refreshMappings: async () => {
      try {
        const mappings = await api.listMappings();
        dispatch({ type: 'SET_MAPPINGS', payload: mappings });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// PUBLIC_INTERFACE
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
