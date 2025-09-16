import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { logger } from '../services/logger';

// PUBLIC_INTERFACE
export default function ModelsPage() {
  const { state, api, refreshModels } = useApp();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const add = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      await api.createModel({ name });
      logger.info('Created new model', { name });
      setName('');
      refreshModels();
    } catch (e) {
      setError(e.message || 'Failed to create model');
      logger.error('Failed to create model:', e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to delete this model?')) return;
    setBusy(true);
    setError('');
    try {
      await api.deleteModel(id);
      logger.info('Deleted model', { id });
      refreshModels();
    } catch (e) {
      setError(e.message || 'Failed to delete model');
      logger.error('Failed to delete model:', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Service Models</h2>
      {error && <div className="error">{error}</div>}
      <div className="form-inline">
        <input 
          className="form-input"
          placeholder="New model name" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
        />
        <button 
          className="btn primary" 
          onClick={add} 
          disabled={busy || !name.trim() || state.loading}
        >
          {busy ? <span className="spinner"></span> : 'Add Model'}
        </button>
      </div>
      <div className={`list ${state.loading ? 'loading' : ''}`}>
        {(Array.isArray(state.models) ? state.models : []).map(model => (
          <div key={model.id} className="card mb-2">
            <div className="list-item">
              <Link to={`/models/${model.id}`} className="title">{model.name}</Link>
              <div className="list-item-actions">
                <span className="badge">{model.roles?.length || 0} roles</span>
                <span className="badge">{model.mappings?.length || 0} mappings</span>
                <button 
                  className="btn small" 
                  onClick={() => remove(model.id)} 
                  disabled={busy}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {!state.loading && (Array.isArray(state.models) ? state.models : []).length === 0 && (
          <p className="note text-center">No models yet. Create your first model above.</p>
        )}
      </div>
    </div>
  );
}
