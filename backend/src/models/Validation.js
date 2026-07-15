const VALID_ROLES = ["Student", "Mentor", "Investor", "Admin"];
const VALID_PROJECT_STATUSES = ["Pending", "Approved", "Rejected"];

const isValidRole = (role) => VALID_ROLES.includes(role);

const isValidProjectStatus = (status) => VALID_PROJECT_STATUSES.includes(status);

module.exports = {
	VALID_ROLES,
	VALID_PROJECT_STATUSES,
	isValidRole,
	isValidProjectStatus,
};
