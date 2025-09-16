import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// PUBLIC_INTERFACE
export default function ModelsPage() {
  const { state, api, refreshModels } = useApp();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await api.createModel({ name });
      setName('');
      refreshModels();
    } catch (e) {
      console.error('Failed to create model:', e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      await api.deleteModel(id);
      refreshModels();
    } catch (e) {
      console.error('Failed to delete model:', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Service Models</h2>
      {state.error && <div className="error">{state.error}</div>}
      <div className="form-inline">
        <input 
          className="form-input"
          placeholder="New model name" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
        />
        <button 
          className="btn primary" 
          onClick={add} 
          disabled={busy || state.loading}
        >
          {busy ? <span className="spinner"></span> : 'Add Model'}
        </button>
      </div>
      <div className={`list ${state.loading ? 'loading' : ''}`}>
        {state.models.map(model => (
          <div key={model.id} className="card mb-2">
            <div className="list-item">
              <Link to={`/models/${model.id}`} className="title">{model.name}</Link>
              <div className="list-item-actions">
                <span className="badge">{model.roles?.length || 0} roles</span>
                <span className="badge">{model.mappings?.length || 0} mappings</span>
                <button 
                  className="btn small" 
                  onClick={() => remove(model.id)} 
                  disabled={busy || state.loading}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {!state.loading && state.models.length === 0 && (
          <p className="note text-center">No models yet. Create your first model above.</p>
        )}
      </div>
    </div>
  );
}
