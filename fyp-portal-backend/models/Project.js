const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    filePath: { type: String },
    sourceLink: { type: String },
    demoVideoLink: {
      type: String,
      default: null
    },
    demoVideoFile: {
      type: String,
      default: null
    },
    reportFile: {
      type: String,
      default: null
    },
    grade: { type: String },
    marks: { type: Number, default: null },
    obtainedMarks: { type: Number, default: null },
    totalMarks: { type: Number, default: 100 },
    teacherFeedback: { type: String },
    status: {
      type: String,
      enum: ["submitted", "pending", "approved", "rejected", "evaluated"],
      default: "pending",
    },
    customDeadline: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);
