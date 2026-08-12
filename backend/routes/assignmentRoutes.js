const express = require("express");
const { createAssignment, getTeacherAssignments } = require("../controllers/assignmentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAssignmentSubmissions,
  getTeacherSubmissions,
  gradeSubmission,
} = require("../controllers/submissionController");

const router = express.Router();

// Apply teacher checks
router.use(protect);
router.use(authorize("teacher", "admin"));

// Create assignment
router.post("/create", createAssignment);

// Get assignments
router.get("/teacher", getTeacherAssignments);

// Get submissions across all courses
router.get("/submissions/teacher", getTeacherSubmissions);

// Get submissions for a specific assignment
router.get("/:assignmentId/submissions", getAssignmentSubmissions);

// Grade a specific submission
router.put("/submissions/:submissionId/grade", gradeSubmission);

module.exports = router;