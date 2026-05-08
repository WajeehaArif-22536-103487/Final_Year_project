const mongoose = require("mongoose");

const deadlineSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  proposalDeadline: {
    type: Date,
    default: null
  },
  projectDeadline: {
    type: Date,
    default: null
  },
  rejectedDeadline: {  
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Deadline", deadlineSchema);