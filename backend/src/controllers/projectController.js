const Project = require("../models/Project");
const Review = require("../models/Review");
const Interest = require("../models/Interest");

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const createProject = async (req, res) => {
  try {
    const { title, description, domain, technology, githubLink, demoLink, problemStatement, solution, category, techStack, githubUrl, demoUrl, attachments } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const normalizedTechnology = normalizeList(technology || techStack);

    const project = await Project.create({
      title,
      description,
      domain: domain || category || "General",
      technology: normalizedTechnology,
      githubLink: githubLink || githubUrl || "",
      demoLink: demoLink || demoUrl || "",
      studentId: req.user._id,
      mentorReview: "",
      rating: 0,
      problemStatement: problemStatement || "",
      solution: solution || "",
      category: category || domain || "General",
      techStack: normalizedTechnology,
      githubUrl: githubUrl || githubLink || "",
      demoUrl: demoUrl || demoLink || "",
      attachments: normalizeList(attachments),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role")
      .populate("studentId", "name email role");

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

const getBrowseProjects = async (req, res) => {
  try {
    const query = req.user.role === "Student" ? { status: "Approved" } : {};

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role")
      .populate("studentId", "name email role");

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

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("studentId", "name email role")
      .populate("reviewedBy", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own project",
      });
    }

    const updatePayload = {
      title: req.body.title,
      description: req.body.description,
      domain: req.body.domain || req.body.category,
      technology: normalizeList(req.body.technology || req.body.techStack),
      githubLink: req.body.githubLink || req.body.githubUrl,
      demoLink: req.body.demoLink || req.body.demoUrl,
      problemStatement: req.body.problemStatement,
      solution: req.body.solution,
      category: req.body.category || req.body.domain,
      techStack: normalizeList(req.body.techStack || req.body.technology),
      githubUrl: req.body.githubUrl || req.body.githubLink,
      demoUrl: req.body.demoUrl || req.body.demoLink,
      attachments: normalizeList(req.body.attachments),
    };

    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isOwner = project.studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "Admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this project",
      });
    }

    await Project.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ project: req.params.id });
    await Interest.deleteMany({ projectId: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addReview = async (req, res) => {
  try {
    const projectId = req.params.id || req.body.projectId;
    const rating = Number(req.body.rating);
    const reviewText = req.body.comment || req.body.mentorReview;

    if (!projectId || !rating || !reviewText) {
      return res.status(400).json({
        success: false,
        message: "Project, rating and review text are required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const review = await Review.findOneAndUpdate(
      { project: project._id, mentor: req.user._id },
      { rating, comment: reviewText },
      { upsert: true, runValidators: true, returnDocument: "after" }
    );

    const reviews = await Review.find({ project: project._id });
    const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = reviews.length ? totalRating / reviews.length : 0;

    project.mentorReview = reviewText;
    project.rating = Number(averageRating.toFixed(1));
    project.mentorRating = project.rating;
    project.reviewCount = reviews.length;
    project.reviewedBy = req.user._id;
    await project.save();

    return res.status(201).json({
      success: true,
      message: "Review saved successfully",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markInterested = async (req, res) => {
  try {
    const projectId = req.params.id || req.body.projectId;
    const message = req.body.message || "Interested in this project";
    const contactNumber = req.body.contactNumber || "";
    const meetDate = req.body.meetDate || "";
    const bondSigned = Boolean(req.body.bondSigned);
    const allocatedAmount = Number(req.body.allocatedAmount || 0);
    const notes = req.body.notes || "";

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project is required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const canInvestorAct =
      project.status === "Approved" ||
      project.reviewCount > 0 ||
      Boolean(project.mentorReview);

    if (!canInvestorAct) {
      return res.status(400).json({
        success: false,
        message: "Only reviewed or approved projects can be marked interested",
      });
    }

    const existingInterest = await Interest.findOne({
      projectId: project._id,
      investorId: req.user._id,
    });

    const interest = await Interest.findOneAndUpdate(
      { projectId: project._id, investorId: req.user._id },
      {
        projectId: project._id,
        investorId: req.user._id,
        message,
        contactNumber,
        meetDate,
        bondSigned,
        allocatedAmount,
        notes,
        status: bondSigned
          ? allocatedAmount > 0
            ? "Funds Allocated"
            : "Bond Signed"
          : meetDate
            ? "Meet Scheduled"
            : "Interested",
      },
      { upsert: true, runValidators: true, returnDocument: "after" }
    );

    if (!existingInterest) {
      project.interestedCount += 1;
    }
    await project.save();

    return res.status(201).json({
      success: true,
      message: "Interest marked successfully",
      interest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyInterests = async (req, res) => {
  try {
    const interests = await Interest.find({ investorId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "projectId",
        select: "title description domain technology status mentorReview mentorRating rating rejectionReason createdBy studentId",
        populate: [
          { path: "createdBy", select: "name email phone role" },
          { path: "studentId", select: "name email phone role" },
        ],
      })
      .populate("investorId", "name email role phone");

    return res.status(200).json({
      success: true,
      count: interests.length,
      interests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getIncomingPlans = async (req, res) => {
  try {
    let projectIds = [];

    if (req.user.role === "Student") {
      const projects = await Project.find({ studentId: req.user._id }).select("_id");
      projectIds = projects.map((project) => project._id);
    }

    if (req.user.role === "Mentor") {
      const reviews = await Review.find({ mentor: req.user._id }).select("project");
      projectIds = reviews.map((review) => review.project);
    }

    const plans = await Interest.find({ projectId: { $in: projectIds } })
      .sort({ createdAt: -1 })
      .populate({
        path: "projectId",
        select: "title description domain technology status mentorReview mentorRating rating rejectionReason createdBy studentId",
        populate: [
          { path: "createdBy", select: "name email phone role" },
          { path: "studentId", select: "name email phone role" },
        ],
      })
      .populate("investorId", "name email role phone");

    return res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
};