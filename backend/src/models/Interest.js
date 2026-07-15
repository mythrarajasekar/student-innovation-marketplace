const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema(
	{
		investorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		projectId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Project",
			required: true,
		},
		message: {
			type: String,
			default: "",
			trim: true,
		},
		contactNumber: {
			type: String,
			default: "",
			trim: true,
		},
		meetDate: {
			type: String,
			default: "",
			trim: true,
		},
		bondSigned: {
			type: Boolean,
			default: false,
		},
		allocatedAmount: {
			type: Number,
			default: 0,
			min: 0,
		},
		notes: {
			type: String,
			default: "",
			trim: true,
		},
		status: {
			type: String,
			enum: ["Interested", "Meet Scheduled", "Bond Signed", "Funds Allocated", "Declined"],
			default: "Interested",
		},
	},
	{
		timestamps: true,
	}
);

interestSchema.index({ projectId: 1, investorId: 1 }, { unique: true });

module.exports = mongoose.model("Interest", interestSchema);
