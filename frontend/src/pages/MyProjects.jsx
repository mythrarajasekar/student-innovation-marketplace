import { useEffect, useState } from 'react';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';

const initialEditState = {
  title: '',
  description: '',
  problemStatement: '',
  solution: '',
  category: '',
  techStack: '',
  githubUrl: '',
  demoUrl: '',
  attachments: '',
};

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState(initialEditState);
  const [message, setMessage] = useState('');

  const loadProjects = async () => {
    const { data } = await api.get('/projects/mine');
    setProjects(data.projects);
  };

  useEffect(() => {
    loadProjects().catch(() => setMessage('Unable to load projects'));
  }, []);

  const startEdit = (project) => {
    setEditingProject(project);
    setEditForm({
      title: project.title || '',
      description: project.description || '',
      problemStatement: project.problemStatement || '',
      solution: project.solution || '',
      category: project.domain || project.category || '',
      techStack: (project.technology || project.techStack || []).join(', '),
      githubUrl: project.githubLink || project.githubUrl || '',
      demoUrl: project.demoLink || project.demoUrl || '',
      attachments: (project.attachments || []).join(', '),
    });
  };

  const handleChange = (event) => {
    setEditForm({ ...editForm, [event.target.name]: event.target.value });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    await api.put(`/projects/${editingProject._id}`, {
      ...editForm,
      domain: editForm.category,
      techStack: editForm.techStack.split(',').map((item) => item.trim()).filter(Boolean),
      technology: editForm.techStack.split(',').map((item) => item.trim()).filter(Boolean),
      githubLink: editForm.githubUrl,
      demoLink: editForm.demoUrl,
      attachments: editForm.attachments.split(',').map((item) => item.trim()).filter(Boolean),
    });
    setMessage('Project updated successfully');
    setEditingProject(null);
    setEditForm(initialEditState);
    await loadProjects();
  };

  const handleDelete = async (projectId) => {
    await api.delete(`/projects/${projectId}`);
    setMessage('Project deleted successfully');
    await loadProjects();
  };

  return (
    <div className="d-grid gap-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 className="mb-1">My Projects</h2>
          <p className="text-muted mb-0">Manage the projects you created.</p>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {editingProject && (
        <div className="glass-card p-4">
          <h4 className="mb-4">Edit Project</h4>
          <form onSubmit={handleUpdate} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Title</label>
              <input className="form-control" name="title" value={editForm.title} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Category</label>
              <input className="form-control" name="category" value={editForm.category} onChange={handleChange} />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" name="description" rows="3" value={editForm.description} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <label className="form-label">Problem Statement</label>
              <textarea className="form-control" name="problemStatement" rows="3" value={editForm.problemStatement} onChange={handleChange} />
            </div>
            <div className="col-12">
              <label className="form-label">Solution</label>
              <textarea className="form-control" name="solution" rows="3" value={editForm.solution} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Tech Stack</label>
              <input className="form-control" name="techStack" value={editForm.techStack} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">GitHub URL</label>
              <input className="form-control" name="githubUrl" value={editForm.githubUrl} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Demo URL</label>
              <input className="form-control" name="demoUrl" value={editForm.demoUrl} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Attachments</label>
              <input className="form-control" name="attachments" value={editForm.attachments} onChange={handleChange} />
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-warning" type="submit">Save Changes</button>
              <button className="btn btn-outline-secondary" type="button" onClick={() => setEditingProject(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="row g-4">
        {projects.map((project) => (
          <div className="col-lg-4 col-md-6" key={project._id}>
            <ProjectCard
              project={project}
              actionSlot={
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-dark btn-sm" type="button" onClick={() => startEdit(project)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" type="button" onClick={() => handleDelete(project._id)}>
                    Delete
                  </button>
                </div>
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyProjects;