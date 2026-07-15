import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar shadow-sm">
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold letter-space" to="/">
          Student Innovation Marketplace
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#topNav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="topNav">
          <div className="navbar-nav ms-auto gap-2 align-items-lg-center">
            <Link className="nav-link" to="/">Home</Link>
            {!user && <Link className="btn btn-outline-light btn-sm px-3" to="/login">Login</Link>}
            {!user && <Link className="btn btn-warning btn-sm px-3" to="/register">Register</Link>}
            {user && (
              <>
                <span className="badge rounded-pill text-bg-light text-dark px-3 py-2">
                  {user.name} · {user.role}
                </span>
                <Link className="btn btn-outline-light btn-sm px-3" to="/dashboard">Dashboard</Link>
                <button className="btn btn-warning btn-sm px-3" onClick={onLogout} type="button">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;