import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { compose, required, minLength, maxLength } from '../utils/validation';
import { logger } from '../services/logger';

// Mapping form validation schema
const mappingValidator = {
  source: compose(required, minLength(2), maxLength(200)),
  target: compose(required, minLength(2), maxLength(200)),
  type: compose(required)
};

// Available mapping types
const MAPPING_TYPES = [
  { value: 'copy', label: 'Direct Copy' },
  { value: 'transform', label: 'Transform' },
  { value: 'template', label: 'Template' },
  { value: 'conditional', label: 'Conditional' }
];

// PUBLIC_INTERFACE
export default function MappingsPage() {
  const { state, api, refreshMappings } = useApp();
  const [formData, setFormData] = useState({
    source: '',
    target: '',
    type: ''
  });
  const [validation, setValidation] = useState({ valid: true, errors: {} });
  const [busy, setBusy] = useState(false);

  // Validate form
  const validateForm = (data) => {
    const errors = {};
    if (mappingValidator.source(data.source).valid === false) {
      errors.source = mappingValidator.source(data.source).message;
    }
    if (mappingValidator.target(data.target).valid === false) {
      errors.target = mappingValidator.target(data.target).message;
    }
    if (mappingValidator.type(data.type).valid === false) {
      errors.type = mappingValidator.type(data.type).message;
    }
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    setValidation(validateForm(newData));
  };

  // Add new mapping
  const add = async () => {
    const validationResult = validateForm(formData);
    if (!validationResult.valid) {
      setValidation(validationResult);
      return;
    }

    setBusy(true);
    try {
      await api.createMapping(formData);
      logger.info('Created new mapping', formData);
      setFormData({ source: '', target: '', type: '' });
      refreshMappings();
    } catch (e) {
      logger.error('Failed to create mapping:', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Mappings</h2>

      <div className="form">
        <div className="form-grid">
          <div className="form-group">
            <label>Source Path:</label>
            <input
              className={`form-input ${validation.errors.source ? 'invalid' : ''}`}
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="e.g., Service.VLAN.id"
              disabled={busy}
            />
            {validation.errors.source && (
              <div className="form-error">{validation.errors.source}</div>
            )}
          </div>

          <div className="form-group">
            <label>Target YANG Path:</label>
            <input
              className={`form-input ${validation.errors.target ? 'invalid' : ''}`}
              name="target"
              value={formData.target}
              onChange={handleChange}
              placeholder="e.g., Cisco:ios-xe/native/vlan/id"
              disabled={busy}
            />
            {validation.errors.target && (
              <div className="form-error">{validation.errors.target}</div>
            )}
          </div>

          <div className="form-group">
            <label>Mapping Type:</label>
            <select
              className={`form-select ${validation.errors.type ? 'invalid' : ''}`}
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={busy}
            >
              <option value="">Select type...</option>
              {MAPPING_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {validation.errors.type && (
              <div className="form-error">{validation.errors.type}</div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            className="btn primary"
            onClick={add}
            disabled={busy || !validation.valid}
          >
            {busy ? <span className="spinner"></span> : 'Add Mapping'}
          </button>
        </div>
      </div>

      <div className={`list ${state.loading ? 'loading' : ''}`}>
        {Object.entries(
          // Group mappings by type
          state.mappings.reduce((acc, mapping) => {
            acc[mapping.type] = [...(acc[mapping.type] || []), mapping];
            return acc;
          }, {})
        ).map(([type, mappings]) => (
          <div key={type} className="card mb-2">
            <h3 className="title">
              {MAPPING_TYPES.find(t => t.value === type)?.label || type}
            </h3>
            {mappings.map(mapping => (
              <div key={mapping.id} className="list-item">
                <div className="mapping-path">{mapping.source}</div>
                <div className="mapping-arrow">→</div>
                <div className="mapping-path">{mapping.target}</div>
              </div>
            ))}
          </div>
        ))}

        {!state.loading && state.mappings.length === 0 && (
          <p className="note text-center">No mappings defined yet. Add your first mapping above.</p>
        )}
      </div>
    </div>
  );
}
