const express = require("express");
const router = express.Router();

const {
  getUsers,
  deleteUser,
  getProjects,
  approveProject,
  rejectProject,
  getDashboardStats,
} = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect, authorizeRoles("Admin"));

router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.delete("/user/:id", deleteUser);
router.get("/projects", getProjects);
router.patch("/projects/:id/approve", approveProject);
router.put("/approve/:id", approveProject);
router.patch("/projects/:id/reject", rejectProject);
router.get("/dashboard", getDashboardStats);

module.exports = router;