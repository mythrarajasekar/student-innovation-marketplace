const ProjectCard = ({ project, actionSlot }) => {
  const displayStatus =
    project.status === 'Pending' && (project.reviewCount > 0 || project.mentorReview)
      ? 'Reviewed'
      : project.status || 'Pending';

  const statusClass = `status-${displayStatus.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="card project-card h-100 border-0 shadow-sm">
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <h5 className="card-title mb-1">{project.title}</h5>
            <p className="text-muted small mb-0">By {project.createdBy?.name || 'Unknown'}</p>
          </div>
          <span className={`badge status-badge ${statusClass}`}>
            {displayStatus}
          </span>
        </div>

        <p className="card-text text-muted flex-grow-1">{project.description}</p>

        <div className="mb-2 small text-muted">
          <div><strong>Domain:</strong> {project.domain || project.category || 'General'}</div>
          <div><strong>Technology:</strong> {(project.technology || project.techStack || []).join(', ')}</div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {(project.technology || project.techStack || []).slice(0, 4).map((tech) => (
            <span key={tech} className="badge rounded-pill text-bg-light tech-pill">{tech}</span>
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
          <span>Rating: {project.mentorRating || 0}/5</span>
          <span>Interest: {project.interestedCount || 0}</span>
        </div>

        {project.mentorReview && (
          <div className="alert alert-success py-2 small mb-3">
            Mentor review submitted
          </div>
        )}

        {project.rejectionReason && (
          <div className="alert alert-warning py-2 small mb-3">
            {project.rejectionReason}
          </div>
        )}

        {actionSlot && <div className="mt-auto">{actionSlot}</div>}
      </div>
    </div>
  );
};

export default ProjectCard;