const mongoose = require("mongoose");

const preApprovedStudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    registrationNo: {
      type: String,
      required: true,
      unique: true
    },
    cnic: {
      type: String,
      required: true
    },
    isRegistered: {
      type: Boolean,
      default: false
    },
    addedBy: {  
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PreApprovedStudent", preApprovedStudentSchema);