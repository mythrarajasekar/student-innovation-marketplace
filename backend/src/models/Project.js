const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		domain: {
			type: String,
			default: "General",
			trim: true,
		},
		technology: [
			{
				type: String,
				trim: true,
			},
		],
		githubLink: {
			type: String,
			default: "",
			trim: true,
		},
		demoLink: {
			type: String,
			default: "",
			trim: true,
		},
		studentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		mentorReview: {
			type: String,
			default: "",
			trim: true,
		},
		rating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
		},
		problemStatement: {
			type: String,
			default: "",
			trim: true,
		},
		solution: {
			type: String,
			default: "",
			trim: true,
		},
		category: {
			type: String,
			default: "General",
			trim: true,
		},
		techStack: [
			{
				type: String,
				trim: true,
			},
		],
		githubUrl: {
			type: String,
			default: "",
			trim: true,
		},
		demoUrl: {
			type: String,
			default: "",
			trim: true,
		},
		attachments: [
			{
				type: String,
			},
		],
		status: {
			type: String,
			enum: ["Pending", "Approved", "Rejected"],
			default: "Pending",
		},
		rejectionReason: {
			type: String,
			default: "",
			trim: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		reviewedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		mentorRating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
		},
		reviewCount: {
			type: Number,
			default: 0,
		},
		interestedCount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Project", projectSchema);
