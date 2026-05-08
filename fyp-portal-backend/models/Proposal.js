const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    teacherFeedback: { type: String },
    deadline: { type: Date },
    fileName: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Proposal", proposalSchema);
