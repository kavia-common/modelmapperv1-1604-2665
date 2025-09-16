import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { compose, required, pattern } from '../utils/validation';
import { logger } from '../services/logger';
import './device.css';

// Device form validation schema
const deviceValidator = {
  name: compose(
    required,
    pattern(/^[a-zA-Z0-9-_.]+$/, 'Only letters, numbers, hyphens, dots, and underscores allowed')
  ),
  host: compose(
    required,
    pattern(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$|^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
      'Enter a valid hostname or IP address'
    )
  ),
  port: compose(
    required,
    pattern(/^\d+$/, 'Port must be a number')
  ),
  username: required,
  password: required
};

// PUBLIC_INTERFACE
export default function DevicePage() {
  const { api } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: '830', // Default NETCONF port
    username: '',
    password: ''
  });
  const [validation, setValidation] = useState({ valid: true, errors: {} });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [yangModels, setYangModels] = useState([]);

  // Validate form
  const validateForm = (data) => {
    const errors = {};
    Object.entries(deviceValidator).forEach(([field, validator]) => {
      const result = validator(data[field]);
      if (!result.valid) {
        errors[field] = result.message;
      }
    });
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

  // Connect to device
  const connect = async () => {
    const validationResult = validateForm(formData);
    if (!validationResult.valid) {
      setValidation(validationResult);
      return;
    }

    setBusy(true);
    setStatus(null);
    setYangModels([]);
    
    try {
      const result = await api.deviceConnection(formData);
      logger.info('Device connection established', { device: formData.name });
      setStatus({
        success: true,
        message: result.message,
        sessionId: result.sessionId
      });

      // In real implementation, we'd fetch YANG models here
      // For now, show mock data
      setYangModels([
        { name: 'ietf-interfaces', revision: '2018-02-20' },
        { name: 'openconfig-interfaces', revision: '2021-04-06' },
        { name: 'cisco-ios-xe-native', revision: '2022-01-15' }
      ]);
    } catch (e) {
      logger.error('Device connection failed:', e);
      setStatus({
        success: false,
        message: e.message || 'Connection failed'
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Device Connection</h2>
      
      <div className="form">
        <div className="form-grid">
          <div className="form-group">
            <label>Device Name:</label>
            <input
              className={`form-input ${validation.errors.name ? 'invalid' : ''}`}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., edge-router-1"
              disabled={busy}
            />
            {validation.errors.name && (
              <div className="form-error">{validation.errors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label>Hostname/IP:</label>
            <input
              className={`form-input ${validation.errors.host ? 'invalid' : ''}`}
              name="host"
              value={formData.host}
              onChange={handleChange}
              placeholder="e.g., router.example.com or 192.168.1.1"
              disabled={busy}
            />
            {validation.errors.host && (
              <div className="form-error">{validation.errors.host}</div>
            )}
          </div>

          <div className="form-group">
            <label>Port:</label>
            <input
              className={`form-input ${validation.errors.port ? 'invalid' : ''}`}
              name="port"
              value={formData.port}
              onChange={handleChange}
              placeholder="NETCONF port (default: 830)"
              disabled={busy}
            />
            {validation.errors.port && (
              <div className="form-error">{validation.errors.port}</div>
            )}
          </div>

          <div className="form-group">
            <label>Username:</label>
            <input
              className={`form-input ${validation.errors.username ? 'invalid' : ''}`}
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="NETCONF username"
              disabled={busy}
            />
            {validation.errors.username && (
              <div className="form-error">{validation.errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              className={`form-input ${validation.errors.password ? 'invalid' : ''}`}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="NETCONF password"
              disabled={busy}
            />
            {validation.errors.password && (
              <div className="form-error">{validation.errors.password}</div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            className="btn primary"
            onClick={connect}
            disabled={busy || !validation.valid}
          >
            {busy ? <span className="spinner"></span> : 'Connect'}
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {status && (
        <div className={`status-panel ${status.success ? 'success' : 'error'}`}>
          <div className="status-item">
            <label>Status:</label>
            <span>{status.message}</span>
          </div>
          {status.sessionId && (
            <div className="status-item">
              <label>Session ID:</label>
              <span>{status.sessionId}</span>
            </div>
          )}
        </div>
      )}

      {/* YANG Models */}
      {yangModels.length > 0 && (
        <div className="card mt-2">
          <h3>Available YANG Models</h3>
          <div className="list">
            {yangModels.map(model => (
              <div key={model.name} className="list-item">
                <div className="yang-model-name">{model.name}</div>
                <div className="yang-model-meta">
                  <span className="badge">Rev: {model.revision}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
