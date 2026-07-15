import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = ({ onAuthSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('token', data.token);
      onAuthSuccess(data.user);
      navigate('/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card glass-card p-4 p-md-5 mx-auto">
        <h2 className="mb-2">Login</h2>
        <p className="text-muted mb-4">Access your dashboard as a student, mentor, investor, or admin.</p>

        {message && <div className="alert alert-danger">{message}</div>}

        <form onSubmit={handleSubmit} className="d-grid gap-3">
          <div>
            <label className="form-label">Email</label>
            <input className="form-control form-control-lg" type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input className="form-control form-control-lg" type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <button className="btn btn-warning btn-lg" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 mb-0 text-muted">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;