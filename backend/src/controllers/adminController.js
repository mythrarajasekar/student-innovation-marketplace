const User = require("../models/User");
const Project = require("../models/Project");
const Review = require("../models/Review");
const Interest = require("../models/Interest");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Project.deleteMany({ $or: [{ createdBy: user._id }, { studentId: user._id }] });
    await Review.deleteMany({ mentor: user._id });
    await Interest.deleteMany({ investorId: user._id });
    await User.findByIdAndDelete(user._id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role")
      .populate("reviewedBy", "name email role");

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.status = "Approved";
    project.rejectionReason = "";
    project.rating = project.rating || 0;
    project.reviewedBy = req.user._id;
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project approved successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectProject = async (req, res) => {
  try {
    const { reason } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.status = "Rejected";
    project.rejectionReason = reason || "Rejected by admin";
    project.reviewedBy = req.user._id;
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project rejected successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "Student" });
    const totalMentors = await User.countDocuments({ role: "Mentor" });
    const totalInvestors = await User.countDocuments({ role: "Investor" });
    const totalAdmins = await User.countDocuments({ role: "Admin" });

    const totalProjects = await Project.countDocuments();
    const pendingProjects = await Project.countDocuments({ status: "Pending" });
    const approvedProjects = await Project.countDocuments({ status: "Approved" });
    const rejectedProjects = await Project.countDocuments({ status: "Rejected" });

    const totalReviews = await Review.countDocuments();
    const totalInterests = await Interest.countDocuments();

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalMentors,
        totalInvestors,
        totalAdmins,
        totalProjects,
        pendingProjects,
        approvedProjects,
        rejectedProjects,
        totalReviews,
        totalInterests,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUsers,
  deleteUser,
  getProjects,
  approveProject,
  rejectProject,
  getDashboardStats,
};