const express = require("express")
const router = express.Router()

const { getStudentCourses } = require("../../controllers/student/studentCourseController")
const { getStudentAttendance } = require("../../controllers/student/studentAttendanceController")
const { getStudentMarks } = require("../../controllers/student/studentMarksController")
const { getStudentAssignments } = require("../../controllers/student/studentAssignmentController")
const { protect, authorize } = require("../../middleware/authMiddleware")
const { submitAssignment } = require("../../controllers/student/studentSubmissionController") 
const {upload} = require("../../middleware/upload")
const { getStudentDashboard } = require("../../controllers/student/studentDashboardController")

router.get("/courses", protect, authorize("student"), getStudentCourses)
router.get("/attendance", protect, authorize("student"), getStudentAttendance)
router.get("/marks", protect, authorize("student"), getStudentMarks)
router.get("/assignments", protect, authorize("student"), getStudentAssignments)
router.post("/assignments/submit", protect, authorize("student"), upload.single("file"), submitAssignment)
router.get("/dashboard", protect, authorize("student"), getStudentDashboard)

module.exports = router

