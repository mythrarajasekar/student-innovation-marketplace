import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminProjects, setAdminProjects] = useState([]);
  const [investorProjects, setInvestorProjects] = useState([]);
  const [investorInterests, setInvestorInterests] = useState([]);
  const [incomingPlans, setIncomingPlans] = useState([]);
  const [investmentForms, setInvestmentForms] = useState({});

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        if (user?.role === 'Admin') {
          const [dashboardResponse, usersResponse, projectsResponse] = await Promise.all([
            api.get('/admin/dashboard'),
            api.get('/admin/users'),
            api.get('/admin/projects'),
          ]);

          setStats(dashboardResponse.data.stats);
          setAdminUsers(usersResponse.data.users);
          setAdminProjects(projectsResponse.data.projects);
          return;
        }

        if (user?.role === 'Student') {
          const [projectsResponse, plansResponse] = await Promise.all([
            api.get('/projects/mine'),
            api.get('/projects/interests/incoming'),
          ]);

          setStats({ totalProjects: projectsResponse.data.count, incomingPlans: plansResponse.data.count });
          setIncomingPlans(plansResponse.data.plans);
          return;
        }

        if (user?.role === 'Mentor') {
          const [projectsResponse, plansResponse] = await Promise.all([
            api.get('/projects/browse'),
            api.get('/projects/interests/incoming'),
          ]);

          setStats({ visibleProjects: projectsResponse.data.count, incomingPlans: plansResponse.data.count });
          setIncomingPlans(plansResponse.data.plans);
          return;
        }

        if (user?.role === 'Investor') {
          const [projectsResponse, interestsResponse] = await Promise.all([
            api.get('/projects/browse'),
            api.get('/projects/interests/mine'),
          ]);

          setStats({ visibleProjects: projectsResponse.data.count, interests: interestsResponse.data.count });
          setInvestorProjects(projectsResponse.data.projects);
          setInvestorInterests(interestsResponse.data.interests);
          return;
        }

        const { data } = await api.get('/projects');
        setStats({ visibleProjects: data.count });
      } catch (error) {
        setMessage(error.response?.data?.message || 'Unable to load dashboard');
      }
    };

    loadDashboard();
  }, [user]);

  const refreshAdminData = async () => {
    const [usersResponse, projectsResponse] = await Promise.all([
      api.get('/admin/users'),
      api.get('/admin/projects'),
    ]);

    setAdminUsers(usersResponse.data.users);
    setAdminProjects(projectsResponse.data.projects);
  };

  const approveProject = async (projectId) => {
    await api.put(`/admin/approve/${projectId}`);
    setMessage('Project approved successfully');
    await refreshAdminData();
  };

  const rejectProject = async (projectId) => {
    const reason = window.prompt('Enter rejection reason');
    if (reason === null) {
      return;
    }

    await api.patch(`/admin/projects/${projectId}/reject`, { reason });
    setMessage('Project rejected successfully');
    await refreshAdminData();
  };

  const deleteUser = async (userId) => {
    await api.delete(`/admin/user/${userId}`);
    setMessage('User deleted successfully');
    await refreshAdminData();
  };

  const getInvestorSavedData = (projectId) => {
    const existing = investorInterests.find((interest) => interest.projectId?._id === projectId) || {};

    return {
      contactNumber: existing.contactNumber || '',
      meetDate: existing.meetDate || '',
      bondSigned: Boolean(existing.bondSigned),
      allocatedAmount: existing.allocatedAmount ?? '',
      notes: existing.notes || '',
      message: existing.message || '',
    };
  };

  const updateInvestorForm = (projectId, field, value) => {
    setInvestmentForms((current) => ({
      ...current,
      [projectId]: {
        ...(current[projectId] || getInvestorSavedData(projectId)),
        [field]: value,
      },
    }));
  };

  const saveInvestorPlan = async (projectId) => {
    const currentForm = investmentForms[projectId] || getInvestorSavedData(projectId);

    await api.post('/projects/interested', {
      projectId,
      message: currentForm.message || 'Interested in this project',
      contactNumber: currentForm.contactNumber,
      meetDate: currentForm.meetDate,
      bondSigned: currentForm.bondSigned,
      allocatedAmount: Number(currentForm.allocatedAmount || 0),
      notes: currentForm.notes,
    });

    setMessage('Investor plan saved successfully');

    const [projectsResponse, interestsResponse] = await Promise.all([
      api.get('/projects/browse'),
      api.get('/projects/interests/mine'),
    ]);

    setInvestorProjects(projectsResponse.data.projects);
    setInvestorInterests(interestsResponse.data.interests);
  };

  const renderRoleSummary = () => {
    if (user?.role === 'Admin' && stats) {
      return (
        <div className="d-grid gap-4">
          <div className="row g-3">
            {[
              ['Total Users', stats.totalUsers],
              ['Students', stats.totalStudents],
              ['Mentors', stats.totalMentors],
              ['Investors', stats.totalInvestors],
              ['Projects', stats.totalProjects],
              ['Pending', stats.pendingProjects],
              ['Approved', stats.approvedProjects],
              ['Rejected', stats.rejectedProjects],
            ].map(([label, value]) => (
              <div className="col-md-3" key={label}>
                <div className="glass-card p-3 h-100">
                  <p className="text-muted small mb-1">{label}</p>
                  <h3 className="mb-0">{value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-4">
            <h4 className="mb-3">Users</h4>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((adminUser) => (
                    <tr key={adminUser._id}>
                      <td>{adminUser.name}</td>
                      <td>{adminUser.email}</td>
                      <td>{adminUser.role}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-danger" type="button" onClick={() => deleteUser(adminUser._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card p-4">
            <h4 className="mb-3">Projects</h4>
            <div className="row g-3">
              {adminProjects.map((project) => (
                <div className="col-lg-4 col-md-6" key={project._id}>
                  <ProjectCard
                    project={project}
                    actionSlot={
                      <div className="d-flex gap-2">
                        <button className="btn btn-success btn-sm" type="button" onClick={() => approveProject(project._id)}>
                          Approve
                        </button>
                        <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => rejectProject(project._id)}>
                          Reject
                        </button>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if ((user?.role === 'Student' || user?.role === 'Mentor') && stats) {
      return (
        <div className="row g-3">
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <p className="text-muted small mb-1">Welcome</p>
              <h3 className="mb-0">{user?.name}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <p className="text-muted small mb-1">Role</p>
              <h3 className="mb-0">{user?.role}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <p className="text-muted small mb-1">{user?.role === 'Student' ? 'My Projects' : 'Visible Projects'}</p>
              <h3 className="mb-0">{stats.totalProjects ?? stats.visibleProjects ?? 0}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <p className="text-muted small mb-1">Incoming Plans</p>
              <h3 className="mb-0">{stats.incomingPlans ?? 0}</h3>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="row g-3">
        <div className="col-md-4">
          <div className="glass-card p-4 h-100">
            <p className="text-muted small mb-1">Welcome</p>
            <h3 className="mb-0">{user?.name}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-4 h-100">
            <p className="text-muted small mb-1">Role</p>
            <h3 className="mb-0">{user?.role}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-4 h-100">
            <p className="text-muted small mb-1">Projects</p>
            <h3 className="mb-0">{stats?.totalProjects ?? stats?.visibleProjects ?? 0}</h3>
          </div>
        </div>
        {user?.role === 'Investor' && (
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <p className="text-muted small mb-1">Plans Saved</p>
              <h3 className="mb-0">{stats?.interests ?? investorInterests.length ?? 0}</h3>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderIncomingPlans = () => {
    if (user?.role !== 'Student' && user?.role !== 'Mentor') {
      return null;
    }

    return (
      <div className="glass-card p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <h4 className="mb-1">Incoming Investment Plans</h4>
            <p className="text-muted mb-0">These are the investor meeting and funding plans received for your projects.</p>
          </div>
        </div>

        <div className="row g-4">
          {incomingPlans.map((plan) => {
            const project = plan.projectId;

            if (!project) {
              return null;
            }

            return (
              <div className="col-lg-6" key={plan._id}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4 d-grid gap-3">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <h5 className="mb-1">{project.title}</h5>
                        <p className="text-muted small mb-0">{project.domain || project.category || 'General'}</p>
                      </div>
                      <span className="badge text-bg-dark">{plan.status}</span>
                    </div>

                    <div className="small text-muted">
                      <div><strong>Investor:</strong> {plan.investorId?.name || 'Unknown'}</div>
                      <div><strong>Investor Phone:</strong> {plan.contactNumber || plan.investorId?.phone || 'Not set'}</div>
                      <div><strong>Meeting Date:</strong> {plan.meetDate || 'Not scheduled'}</div>
                      <div><strong>Bond Signed:</strong> {plan.bondSigned ? 'Yes' : 'No'}</div>
                      <div><strong>Allocated Amount:</strong> ${Number(plan.allocatedAmount || 0).toLocaleString()}</div>
                      <div><strong>Notes:</strong> {plan.notes || 'No notes added'}</div>
                    </div>

                    {plan.investorId?.phone && (
                      <a className="btn btn-outline-primary btn-sm align-self-start" href={`tel:${plan.investorId.phone}`}>
                        Call Investor
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderInvestorWorkspace = () => {
    if (user?.role !== 'Investor') {
      return null;
    }

    const totalAllocated = investorInterests.reduce((sum, interest) => sum + Number(interest.allocatedAmount || 0), 0);
    const meetingsScheduled = investorInterests.filter((interest) => Boolean(interest.meetDate)).length;
    const bondsSigned = investorInterests.filter((interest) => interest.bondSigned).length;

    return (
      <div className="d-grid gap-4">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <p className="text-muted small mb-1">Total Allocated</p>
              <h3 className="mb-0">${totalAllocated.toLocaleString()}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <p className="text-muted small mb-1">Meetings Scheduled</p>
              <h3 className="mb-0">{meetingsScheduled}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <p className="text-muted small mb-1">Bonds Signed</p>
              <h3 className="mb-0">{bondsSigned}</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <h4 className="mb-1">Investor Dashboard</h4>
            <p className="text-muted mb-0">Leave your phone number, schedule a meeting, sign the bond, and allocate money for projects.</p>
          </div>
        </div>

        <div className="row g-4">
          {investorProjects.map((project) => {
            const savedData = investmentForms[project._id] || getInvestorSavedData(project._id);
            const projectOwner = project.studentId || project.createdBy;

            return (
              <div className="col-lg-6" key={project._id}>
                <ProjectCard
                  project={project}
                  actionSlot={
                    <div className="d-grid gap-3">
                      <div>
                        <label className="form-label small mb-1">Your Contact Number</label>
                        <input
                          className="form-control form-control-sm"
                          type="tel"
                          value={savedData.contactNumber}
                          onChange={(event) => updateInvestorForm(project._id, 'contactNumber', event.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div>
                        <label className="form-label small mb-1">Meeting Date</label>
                        <input
                          className="form-control form-control-sm"
                          type="date"
                          value={savedData.meetDate}
                          onChange={(event) => updateInvestorForm(project._id, 'meetDate', event.target.value)}
                        />
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={savedData.bondSigned}
                          onChange={(event) => updateInvestorForm(project._id, 'bondSigned', event.target.checked)}
                          id={`bond-${project._id}`}
                        />
                        <label className="form-check-label small" htmlFor={`bond-${project._id}`}>
                          Bond signed
                        </label>
                      </div>

                      <div>
                        <label className="form-label small mb-1">Allocate Money</label>
                        <input
                          className="form-control form-control-sm"
                          type="number"
                          min="0"
                          value={savedData.allocatedAmount}
                          onChange={(event) => updateInvestorForm(project._id, 'allocatedAmount', event.target.value)}
                          placeholder="Amount"
                        />
                      </div>

                      <div>
                        <label className="form-label small mb-1">Notes</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows="2"
                          value={savedData.notes}
                          onChange={(event) => updateInvestorForm(project._id, 'notes', event.target.value)}
                          placeholder="Meeting or funding notes"
                        />
                      </div>

                      <div className="alert alert-light border py-2 small mb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <span>
                          Student: {projectOwner?.name || 'Unknown'}
                          {projectOwner?.phone ? ` · ${projectOwner.phone}` : ''}
                        </span>
                        {projectOwner?.phone && (
                          <a className="btn btn-outline-primary btn-sm" href={`tel:${projectOwner.phone}`}>
                            Call Student
                          </a>
                        )}
                      </div>

                      <button className="btn btn-dark btn-sm" type="button" onClick={() => saveInvestorPlan(project._id)}>
                        Save Meet / Bond / Funding Plan
                      </button>
                    </div>
                  }
                />
              </div>
            );
          })}
        </div>

        </div>

        <div className="glass-card p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
            <div>
              <h4 className="mb-1">Saved Investment Plans</h4>
              <p className="text-muted mb-0">Review who you will meet, who has signed, and where money has been allocated.</p>
            </div>
          </div>

          <div className="row g-4">
            {investorInterests.map((interest) => {
              const project = interest.projectId;

              if (!project) {
                return null;
              }

              const projectOwner = project.studentId || project.createdBy;

              return (
                <div className="col-lg-6" key={interest._id}>
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4 d-grid gap-3">
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <h5 className="mb-1">{project.title}</h5>
                          <p className="text-muted small mb-0">{project.domain || project.category || 'General'}</p>
                        </div>
                        <span className="badge text-bg-dark">{interest.status}</span>
                      </div>

                      <div className="small text-muted">
                        <div><strong>Contact Number:</strong> {interest.contactNumber || 'Not set'}</div>
                        <div><strong>Meeting Date:</strong> {interest.meetDate || 'Not scheduled'}</div>
                        <div><strong>Bond Signed:</strong> {interest.bondSigned ? 'Yes' : 'No'}</div>
                        <div><strong>Allocated Amount:</strong> ${Number(interest.allocatedAmount || 0).toLocaleString()}</div>
                        <div><strong>Notes:</strong> {interest.notes || 'No notes added'}</div>
                      </div>

                      <div className="alert alert-light border py-2 small mb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <span>
                          Student: {projectOwner?.name || 'Unknown'}
                          {projectOwner?.phone ? ` · ${projectOwner.phone}` : ''}
                        </span>
                        {projectOwner?.phone && (
                          <a className="btn btn-outline-primary btn-sm" href={`tel:${projectOwner.phone}`}>
                            Call Student
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />
      <section className="dashboard-content d-grid gap-4">
        <div>
          <p className="eyebrow mb-2">Dashboard</p>
          <h1 className="display-6 fw-bold mb-2">Manage your innovation workflow</h1>
          <p className="text-muted mb-0">Everything you need for your role is in one place.</p>
        </div>

        {message && <div className="alert alert-danger">{message}</div>}

        {renderRoleSummary()}

        {renderIncomingPlans()}

        {renderInvestorWorkspace()}
      </section>
    </div>
  );
};

export default Dashboard;