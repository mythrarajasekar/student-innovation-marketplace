import { Link } from 'react-router-dom';

const Sidebar = ({ user }) => {
  const links = [
    { to: '/dashboard', label: 'Overview' },
  ];

  if (user?.role === 'Student') {
    links.push(
      { to: '/create-project', label: 'Create Project' },
      { to: '/my-projects', label: 'My Projects' },
      { to: '/projects', label: 'Browse Projects' },
    );
  }

  if (user?.role === 'Mentor') {
    links.push({ to: '/projects', label: 'Review Projects' });
  }

  if (user?.role === 'Investor') {
    links.push({ to: '/projects', label: 'Discover Projects' });
  }

  if (user?.role === 'Admin') {
    links.push({ to: '/projects', label: 'Manage Projects' });
  }

  return (
    <aside className="sidebar-panel glass-card p-4">
      <div className="mb-4">
        <p className="text-uppercase text-muted small mb-1">Signed in as</p>
        <h5 className="mb-0">{user?.name}</h5>
        <p className="mb-0 text-muted">{user?.role}</p>
      </div>
      <div className="d-grid gap-2">
        {links.map((link) => (
          <Link key={link.to} className="btn btn-soft" to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;