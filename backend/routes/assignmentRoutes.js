const express = require("express")
const { createAssignment, getTeacherAssignments } = require("../controllers/assignmentController")
const { verifyToken } = require("../middleware/authMiddleware")
const {
  getAssignmentSubmissions,
  gradeSubmission
} = require("../controllers/submissionController")
const router = express.Router()

// create assignment
router.post("/create", verifyToken, createAssignment)

// get teacher assignments
router.get("/teacher", verifyToken, getTeacherAssignments)
router.get(
  "/:assignmentId/submissions",
  verifyToken,
  getAssignmentSubmissions
)

router.put(
  "/submissions/:submissionId/grade",
  verifyToken,
  gradeSubmission
)
module.exports = router