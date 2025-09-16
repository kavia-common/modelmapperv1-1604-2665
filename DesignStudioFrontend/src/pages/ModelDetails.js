import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { compose, required, minLength, maxLength } from '../utils/validation';
import { logger } from '../services/logger';

// Model form validation schema
const modelValidator = compose(
  required,
  minLength(3),
  maxLength(100)
);

// PUBLIC_INTERFACE
export default function ModelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, api, refreshModels } = useApp();
  const [model, setModel] = useState(null);
  const [name, setName] = useState('');
  const [validation, setValidation] = useState({ valid: true, message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Load model data
  useEffect(() => {
    const loadModel = async () => {
      setBusy(true);
      setError('');
      try {
        const data = await api.getModel(id);
        setModel(data);
        setName(data.name);
      } catch (e) {
        logger.error(`Failed to load model ${id}:`, e);
        setError(String(e.message || e));
      } finally {
        setBusy(false);
      }
    };
    loadModel();
  }, [id, api]);

  // Validate form input
  useEffect(() => {
    if (name) {
      const result = modelValidator(name);
      setValidation(result);
    }
  }, [name]);

  // Handle save
  const save = async () => {
    if (!validation.valid) return;
    setBusy(true);
    setError('');
    try {
      const updated = await api.updateModel(id, { ...model, name });
      setModel(updated);
      refreshModels(); // Update models list
      logger.info(`Updated model ${id}`, { name });
    } catch (e) {
      logger.error(`Failed to update model ${id}:`, e);
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  // Handle delete
  const remove = async () => {
    if (!window.confirm('Are you sure you want to delete this model?')) return;
    setBusy(true);
    setError('');
    try {
      await api.deleteModel(id);
      logger.info(`Deleted model ${id}`);
      refreshModels(); // Update models list
      navigate('/models');
    } catch (e) {
      logger.error(`Failed to delete model ${id}:`, e);
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  if (!model && !error) {
    return <div className="container loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button className="btn" onClick={() => navigate('/models')}>Back to Models</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="title">Edit Service Model</h2>
      
      <div className="form">
        <div className="form-group">
          <label>Name:</label>
          <input 
            className={`form-input ${!validation.valid ? 'invalid' : ''}`}
            value={name} 
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
          />
          {!validation.valid && (
            <div className="form-error">{validation.message}</div>
          )}
        </div>

        <div className="form-group">
          <label>ID:</label>
          <input 
            className="form-input" 
            value={model.id} 
            disabled 
          />
        </div>

        <div className="form-group">
          <label>Roles ({model.roles?.length || 0}):</label>
          <div className="list">
            {model.roles?.map(role => (
              <div key={role.id} className="list-item">
                <span>{role.name}</span>
                <span className="badge">{role.section}</span>
              </div>
            ))}
            {(!model.roles || model.roles.length === 0) && (
              <div className="note">No roles assigned</div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Mappings ({model.mappings?.length || 0}):</label>
          <div className="list">
            {model.mappings?.map(mapping => (
              <div key={mapping.id} className="list-item">
                <div>{mapping.source}</div>
                <div className="text-secondary">→</div>
                <div>{mapping.target}</div>
                <span className="badge">{mapping.type}</span>
              </div>
            ))}
            {(!model.mappings || model.mappings.length === 0) && (
              <div className="note">No mappings defined</div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            className="btn" 
            onClick={() => navigate('/models')}
            disabled={busy}
          >
            Back
          </button>
          <button 
            className="btn" 
            onClick={remove}
            disabled={busy}
          >
            Delete
          </button>
          <button 
            className="btn primary" 
            onClick={save}
            disabled={busy || !validation.valid}
          >
            {busy ? <span className="spinner"></span> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
