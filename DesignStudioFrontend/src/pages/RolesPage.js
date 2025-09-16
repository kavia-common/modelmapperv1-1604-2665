import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { compose, required, minLength, maxLength } from '../utils/validation';
import { logger } from '../services/logger';

// Role form validation schema
const roleValidator = {
  name: compose(required, minLength(2), maxLength(50)),
  section: compose(required, minLength(2), maxLength(30))
};

// Available sections
const SECTIONS = ['Core', 'Access', 'Transport', 'Security', 'Management'];

// PUBLIC_INTERFACE
export default function RolesPage() {
  const { state, api, refreshRoles } = useApp();
  const [formData, setFormData] = useState({ name: '', section: '' });
  const [validation, setValidation] = useState({ valid: true, errors: {} });
  const [busy, setBusy] = useState(false);

  // Validate form
  const validateForm = (data) => {
    const errors = {};
    if (roleValidator.name(data.name).valid === false) {
      errors.name = roleValidator.name(data.name).message;
    }
    if (roleValidator.section(data.section).valid === false) {
      errors.section = roleValidator.section(data.section).message;
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

  // Add new role
  const add = async () => {
    const validationResult = validateForm(formData);
    if (!validationResult.valid) {
      setValidation(validationResult);
      return;
    }

    setBusy(true);
    try {
      await api.createRole(formData);
      logger.info('Created new role', formData);
      setFormData({ name: '', section: '' });
      refreshRoles();
    } catch (e) {
      logger.error('Failed to create role:', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Roles</h2>
      
      <div className="form">
        <div className="form-grid">
          <div className="form-group">
            <label>Role Name:</label>
            <input 
              className={`form-input ${validation.errors.name ? 'invalid' : ''}`}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Network Controller"
              disabled={busy}
            />
            {validation.errors.name && (
              <div className="form-error">{validation.errors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label>Section:</label>
            <select
              className={`form-select ${validation.errors.section ? 'invalid' : ''}`}
              name="section"
              value={formData.section}
              onChange={handleChange}
              disabled={busy}
            >
              <option value="">Select section...</option>
              {SECTIONS.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
            {validation.errors.section && (
              <div className="form-error">{validation.errors.section}</div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            className="btn primary" 
            onClick={add}
            disabled={busy || !validation.valid}
          >
            {busy ? <span className="spinner"></span> : 'Add Role'}
          </button>
        </div>
      </div>

      <div className={`list ${state.loading ? 'loading' : ''}`}>
        {Object.entries(
          // Group roles by section
          state.roles.reduce((acc, role) => {
            acc[role.section] = [...(acc[role.section] || []), role];
            return acc;
          }, {})
        ).map(([section, roles]) => (
          <div key={section} className="card mb-2">
            <h3 className="title">{section}</h3>
            {roles.map(role => (
              <div key={role.id} className="list-item">
                <span>{role.name}</span>
                <div className="list-item-actions">
                  <span className="badge">{role.id}</span>
                </div>
              </div>
            ))}
          </div>
        ))}

        {!state.loading && state.roles.length === 0 && (
          <p className="note text-center">No roles defined yet. Add your first role above.</p>
        )}
      </div>
    </div>
  );
}
