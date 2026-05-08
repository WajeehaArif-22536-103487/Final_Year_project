const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@fyp.com" });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      name: "System Admin",
      email: "admin@fyp.com",
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();
    console.log("Admin created successfully");
  } catch (error) {
    console.error("Error creating admin:", error.message);
  } finally {
    process.exit();
  }
};

createAdmin();