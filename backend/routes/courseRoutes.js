const express = require("express");
const { getTeacherCourses, getClassStudents } = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/teacher", protect, authorize("teacher", "admin"), getTeacherCourses);
router.get("/:classId/students", protect, authorize("teacher", "admin"), getClassStudents);

module.exports = router;