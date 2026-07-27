const express = require("express")
const { createAssignment, getTeacherAssignments } = require("../controllers/assignmentController")
const { protect, authorize } = require("../middleware/authMiddleware")
const {
  getAssignmentSubmissions,
  gradeSubmission
} = require("../controllers/submissionController")
const router = express.Router()

// create assignment
router.post("/create", protect, authorize("teacher"), createAssignment)

// get teacher assignments
router.get("/teacher", protect, authorize("teacher"), getTeacherAssignments)
router.get(
  "/:assignmentId/submissions",
  protect,
  authorize("teacher"),
  getAssignmentSubmissions
)

router.put(
  "/submissions/:submissionId/grade",
  protect,
  authorize("teacher"),
  gradeSubmission
)
module.exports = router