import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { logger } from '../services/logger';
import './collaboration.css';

// Mock active users for development
const MOCK_USERS = [
  { id: 'u1', name: 'Alice', role: 'designer', active: true },
  { id: 'u2', name: 'Bob', role: 'reviewer', active: true },
  { id: 'u3', name: 'Charlie', role: 'designer', active: false }
];

// PUBLIC_INTERFACE
export default function CollaborationPage() {
  const { state, api } = useApp();
  const [localState, setLocalState] = useState({
    users: MOCK_USERS,
    changes: [],
    lastUpdate: null
  });
  const [error, setError] = useState('');

  // Poll for updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const collab = await api.getCollaboration();
        setLocalState(prev => ({
          ...prev,
          lastUpdate: new Date().toISOString()
        }));
        
        // In real implementation, we'd use WebSocket for real-time updates
        logger.debug('Collaboration status updated', collab);
      } catch (e) {
        logger.error('Failed to update collaboration status:', e);
        setError(String(e.message || e));
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [api]);

  // Track recent changes
  useEffect(() => {
    if (state.models && state.collaboration?.lastChangeId) {
      setLocalState(prev => ({
        ...prev,
        changes: [
          {
            id: state.collaboration.lastChangeId,
            type: 'model_update',
            timestamp: new Date().toISOString(),
            message: `Models updated (${state.models.length} total)`
          },
          ...prev.changes.slice(0, 9) // Keep last 10 changes
        ]
      }));
    }
  }, [state.models, state.collaboration?.lastChangeId]);

  return (
    <div className="container">
      <h2 className="title">Collaboration</h2>

      {error && <div className="error">{error}</div>}

      <div className="grid">
        {/* Active Users */}
        <div className="card">
          <h3>Active Users</h3>
          <div className="list">
            {localState.users.map(user => (
              <div key={user.id} className="list-item">
                <span className={`status-dot ${user.active ? 'active' : ''}`} />
                <span className="user-name">{user.name}</span>
                <span className="badge">{user.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Changes */}
        <div className="card">
          <h3>Recent Changes</h3>
          <div className="list">
            {localState.changes.map(change => (
              <div key={change.id} className="list-item">
                <div className="change-header">
                  <span className="change-type">{change.type}</span>
                  <span className="change-time">
                    {new Date(change.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="change-message">{change.message}</div>
              </div>
            ))}
            {localState.changes.length === 0 && (
              <div className="note">No recent changes</div>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="status-panel mt-2">
        <div className="status-item">
          <label>Last Update:</label>
          <span>
            {localState.lastUpdate 
              ? new Date(localState.lastUpdate).toLocaleString()
              : 'Never'}
          </span>
        </div>
        <div className="status-item">
          <label>Active Sessions:</label>
          <span>{state.collaboration?.activeUsers || 0}</span>
        </div>
        <div className="status-item">
          <label>Change ID:</label>
          <span>{state.collaboration?.lastChangeId || 0}</span>
        </div>
      </div>
    </div>
  );
}
