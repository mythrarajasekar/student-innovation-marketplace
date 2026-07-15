import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    technology: '',
    githubLink: '',
    demoLink: '',
    attachments: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/projects', {
        ...formData,
        domain: formData.domain,
        category: formData.domain,
        technology: formData.technology.split(',').map((item) => item.trim()).filter(Boolean),
        techStack: formData.technology.split(',').map((item) => item.trim()).filter(Boolean),
        githubLink: formData.githubLink,
        githubUrl: formData.githubLink,
        demoLink: formData.demoLink,
        demoUrl: formData.demoLink,
        attachments: formData.attachments.split(',').map((item) => item.trim()).filter(Boolean),
      });
      setMessage('Project created successfully');
      navigate('/my-projects');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 p-md-5">
      <h2 className="mb-4">Create Project</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Title</label>
          <input className="form-control" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Domain</label>
          <input className="form-control" name="domain" value={formData.domain} onChange={handleChange} />
        </div>
        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea className="form-control" name="description" rows="4" value={formData.description} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Technology</label>
          <input className="form-control" name="technology" value={formData.technology} onChange={handleChange} placeholder="React, Node, MongoDB" />
        </div>
        <div className="col-md-6">
          <label className="form-label">GitHub Link</label>
          <input className="form-control" name="githubLink" value={formData.githubLink} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Demo Link</label>
          <input className="form-control" name="demoLink" value={formData.demoLink} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Attachments</label>
          <input className="form-control" name="attachments" value={formData.attachments} onChange={handleChange} placeholder="Pitch deck link, image URL" />
        </div>
        <div className="col-12">
          <button className="btn btn-warning btn-lg" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;