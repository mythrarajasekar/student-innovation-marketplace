const express = require("express");
const router = express.Router();

const {
  createProject,
  getMyProjects,
  getBrowseProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addReview,
  markInterested,
  getMyInterests,
  getIncomingPlans,
} = require("../controllers/projectController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("Student"), createProject);
router.get("/", protect, getBrowseProjects);
router.get("/mine", protect, authorizeRoles("Student"), getMyProjects);
router.get("/browse", protect, authorizeRoles("Mentor", "Investor", "Admin", "Student"), getBrowseProjects);
router.post("/review", protect, authorizeRoles("Mentor"), addReview);
router.post("/interested", protect, authorizeRoles("Investor"), markInterested);
router.get("/interests/mine", protect, authorizeRoles("Investor"), getMyInterests);
router.get("/interests/incoming", protect, authorizeRoles("Student", "Mentor"), getIncomingPlans);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, authorizeRoles("Student"), updateProject);
router.delete("/:id", protect, authorizeRoles("Student", "Admin"), deleteProject);
router.post("/:id/review", protect, authorizeRoles("Mentor"), addReview);
router.post("/:id/interested", protect, authorizeRoles("Investor"), markInterested);

module.exports = router;