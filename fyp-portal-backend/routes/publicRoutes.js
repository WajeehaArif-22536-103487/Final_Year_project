const express = require("express");
const router = express.Router();

const { getPublicProjects } = require("../controllers/publicController");

// Public repository route (no authentication needed)
router.get("/projects", getPublicProjects);

module.exports = router;