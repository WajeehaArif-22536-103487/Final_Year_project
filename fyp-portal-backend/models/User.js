const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student", "teacher"],
      required: true,
    },
    registrationNo: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "active",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    profilePicture: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "",
    },
    designation: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    program: { 
      type: String, 
      default: ""
    },
    session: { 
      type: String, 
      default: "" 
    },
    semester: { 
      type: String, 
      default: "" 
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
