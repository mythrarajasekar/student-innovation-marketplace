import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = ({ onAuthSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    college: '',
    department: '',
    phone: '',
  });
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
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      onAuthSuccess(data.user);
      navigate('/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card glass-card p-4 p-md-5 mx-auto">
        <h2 className="mb-2">Register</h2>
        <p className="text-muted mb-4">Create an account and join the innovation marketplace.</p>

        {message && <div className="alert alert-danger">{message}</div>}

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input className="form-control" type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Role</label>
            <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
              <option value="Student">Student</option>
              <option value="Mentor">Mentor</option>
              <option value="Investor">Investor</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">College</label>
            <input className="form-control" type="text" name="college" value={formData.college} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Department</label>
            <input className="form-control" type="text" name="department" value={formData.department} onChange={handleChange} required />
          </div>
          <div className="col-12">
            <label className="form-label">Phone</label>
            <input className="form-control" type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div className="col-12">
            <button className="btn btn-warning btn-lg w-100" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>

        <p className="mt-4 mb-0 text-muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;