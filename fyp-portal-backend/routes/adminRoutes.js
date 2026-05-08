const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  deleteUser,
  suspendUser,
  activateUser,
  createTeacher,
  approveTeacher,
  getDashboardStats,
  adminGetAllProposals,
  assignSupervisor,
  getAllApprovedProjects,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);

router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUser,
);

router.put(
  "/suspend/:id",
  authMiddleware,
  roleMiddleware("admin"),
  suspendUser,
);

router.put(
  "/activate/:id",
   authMiddleware, 
   activateUser
);

router.post(
  "/create-teacher",
  authMiddleware,
  roleMiddleware("admin"),
  createTeacher,
);

router.put(
  "/approve-teacher/:id",
  authMiddleware,
  roleMiddleware("admin"),
  approveTeacher,
);

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  getDashboardStats,
);

router.get(
  "/proposals",
  authMiddleware,
  roleMiddleware("admin"),
  adminGetAllProposals,
);

router.post(
  "/assign-supervisor",
  authMiddleware,
  roleMiddleware("admin"),
  assignSupervisor,
);

router.get(
  "/projects",
  authMiddleware,
  roleMiddleware("admin"),
  getAllApprovedProjects,
);



module.exports = router;
