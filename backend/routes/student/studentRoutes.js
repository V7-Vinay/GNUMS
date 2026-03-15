const express = require("express")
const router = express.Router()

const { getStudentCourses } = require("../../controllers/student/studentCourseController")
const { getStudentAttendance } = require("../../controllers/student/studentAttendanceController")
const { getStudentMarks } = require("../../controllers/student/studentMarksController")
const { getStudentAssignments } = require("../../controllers/student/studentAssignmentController")
const { verifyToken } = require("../../middleware/authMiddleware")
const { submitAssignment } = require("../../controllers/student/studentSubmissionController") 
const {upload} = require("../../middleware/upload")
const { getStudentDashboard } = require("../../controllers/student/studentDashboardController")

router.get("/courses", verifyToken, getStudentCourses)
router.get("/attendance", verifyToken, getStudentAttendance)
router.get("/marks", verifyToken, getStudentMarks)
router.get("/assignments", verifyToken, getStudentAssignments)
router.post("/assignments/submit", verifyToken,  upload.single("file"),
 submitAssignment)
 router.get("/dashboard", verifyToken, getStudentDashboard)
module.exports = router
