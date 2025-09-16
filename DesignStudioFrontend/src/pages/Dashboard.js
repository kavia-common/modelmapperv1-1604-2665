import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// PUBLIC_INTERFACE
export default function Dashboard() {
  const { state } = useApp();

  return (
    <div className="container">
      <h1 className="title">Design Studio</h1>
      <p className="description">
        Model telco services, manage roles, and create mappings to vendor-specific YANG models.
      </p>
      
      <div className="grid">
        <Link className="card" to="/models">
          <h3>Service Models</h3>
          <div className="badge">{state.models.length} models</div>
          <p className="description">Create and manage service models</p>
        </Link>
        
        <Link className="card" to="/roles">
          <h3>Roles</h3>
          <div className="badge">{state.roles.length} roles</div>
          <p className="description">Manage service roles and sections</p>
        </Link>
        
        <Link className="card" to="/mappings">
          <h3>Mappings</h3>
          <div className="badge">{state.mappings.length} mappings</div>
          <p className="description">Map services to YANG models</p>
        </Link>
        
        <Link className="card" to="/collaboration">
          <h3>Collaboration</h3>
          <div className="badge">{state.collaboration.activeUsers} active</div>
          <p className="description">Work together in real-time</p>
        </Link>
        
        <Link className="card" to="/device">
          <h3>Device Connection</h3>
          <p className="description">Connect and retrieve YANG models</p>
        </Link>
      </div>
      
      {state.error && (
        <div className="error mt-2">
          Failed to load data: {state.error}
        </div>
      )}
    </div>
  );
}
