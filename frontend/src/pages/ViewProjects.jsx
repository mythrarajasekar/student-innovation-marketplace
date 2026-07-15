import { useEffect, useState } from 'react';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';

const ViewProjects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [message, setMessage] = useState('');

  const loadProjects = async () => {
    const { data } = await api.get('/projects/browse');
    setProjects(data.projects);
  };

  useEffect(() => {
    loadProjects().catch(() => setMessage('Unable to load projects'));
  }, []);

  const handleInterest = async (projectId) => {
    await api.post('/projects/interested', { projectId, message: 'Interested in this project' });
    setMessage('Interest saved successfully');
    await loadProjects();
  };

  const handleReviewChange = (projectId, field, value) => {
    setFeedback({
      ...feedback,
      [projectId]: {
        ...(feedback[projectId] || {}),
        [field]: value,
      },
    });
  };

  const submitReview = async (projectId) => {
    try {
      const reviewData = feedback[projectId] || {};
      const rating = reviewData.rating ?? 5;
      const comment = (reviewData.comment || '').trim();

      if (!comment) {
        setMessage('Please enter a review comment');
        return;
      }

      await api.post(`/projects/${projectId}/review`, {
        projectId,
        rating,
        comment,
        mentorReview: comment,
      });
      setMessage('Review submitted successfully');
      await loadProjects();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to submit review');
    }
  };

  return (
    <div className="d-grid gap-4">
      <div>
        <h2 className="mb-1">Browse Projects</h2>
        <p className="text-muted mb-0">
          {user?.role === 'Mentor' && 'Review and rate student projects.'}
          {user?.role === 'Investor' && 'Browse the full project catalogue and mark the ones you want to track.'}
          {user?.role === 'Student' && 'See what projects are already approved.'}
          {user?.role === 'Admin' && 'View the public project catalogue.'}
        </p>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {projects.length === 0 && !message && (
        <div className="alert alert-secondary">
          {user?.role === 'Investor'
            ? 'No projects are available yet.'
            : user?.role === 'Mentor'
              ? 'No projects have been submitted yet.'
              : 'No projects to display.'}
        </div>
      )}

      <div className="row g-4">
        {projects.map((project) => (
          <div className="col-lg-4 col-md-6" key={project._id}>
            <ProjectCard
              project={project}
              actionSlot={
                <div className="d-grid gap-2">
                  {user?.role === 'Investor' && (
                    <button className="btn btn-dark" type="button" onClick={() => handleInterest(project._id)}>
                      Mark Interested
                    </button>
                  )}

                  {user?.role === 'Mentor' && (
                    <>
                      <div>
                        <label className="form-label small mb-1">Rating</label>
                        <select
                          className="form-select form-select-sm"
                          value={feedback[project._id]?.rating || 5}
                          onChange={(event) => handleReviewChange(project._id, 'rating', Number(event.target.value))}
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                          <option value={5}>5</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label small mb-1">Comment</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows="3"
                          value={feedback[project._id]?.comment || ''}
                          onChange={(event) => handleReviewChange(project._id, 'comment', event.target.value)}
                        />
                      </div>
                      <button className="btn btn-warning" type="button" onClick={() => submitReview(project._id)}>
                        Submit Review
                      </button>
                    </>
                  )}
                </div>
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewProjects;