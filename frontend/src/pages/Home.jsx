import { Link } from 'react-router-dom';

const Home = ({ user }) => {
  return (
    <div className="home-hero">
      <section className="hero-shell glass-card p-5 mb-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <p className="eyebrow mb-2">Student Innovation Marketplace</p>
            <h1 className="display-5 fw-bold mb-3">Showcase student ideas, mentor them, and connect with investors.</h1>
            <p className="lead text-muted mb-4">
              A role-based platform for students, mentors, investors, and admins to collaborate around innovative projects.
            </p>
            <div className="d-flex flex-wrap gap-3">
              {!user && <Link className="btn btn-warning btn-lg" to="/register">Get Started</Link>}
              {!user && <Link className="btn btn-outline-dark btn-lg" to="/login">Login</Link>}
              {user && <Link className="btn btn-dark btn-lg" to="/dashboard">Go to Dashboard</Link>}
            </div>
          </div>
          <div className="col-lg-5">
            <div className="feature-grid">
              <div className="feature-tile">Student uploads</div>
              <div className="feature-tile">Mentor reviews</div>
              <div className="feature-tile">Investor interest</div>
              <div className="feature-tile">Admin control</div>
            </div>
          </div>
        </div>
      </section>

      <section className="row g-4">
        {[
          'Built for clean MVC-driven workflows',
          'JWT authentication stored in localStorage',
          'Bootstrap UI with a modern marketplace look',
        ].map((item) => (
          <div className="col-md-4" key={item}>
            <div className="glass-card p-4 h-100">
              <h5 className="mb-2">{item}</h5>
              <p className="text-muted mb-0">Designed for fast navigation and clear role-based actions.</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;