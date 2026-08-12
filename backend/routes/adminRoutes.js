const express = require("express");
const {
  getUsers,
  createUser,
  deleteUser,
  updateUser,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  enrollStudent,
  getDashboardStats,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(protect);
router.use(authorize("admin"));

// Dashboard Statistics
router.get("/dashboard", getDashboardStats);

// User CRUD
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Class CRUD
router.get("/classes", getClasses);
router.post("/classes", createClass);
router.put("/classes/:id", updateClass);
router.delete("/classes/:id", deleteClass);

// Enroll Student
router.post("/classes/enroll", enrollStudent);

module.exports = router;
