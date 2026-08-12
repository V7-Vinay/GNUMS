const express = require("express")
const { markAttendance, getTeacherAttendance } = require("../controllers/attendanceController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/mark", protect, authorize("teacher", "admin"), markAttendance)
router.get("/teacher", protect, authorize("teacher"), getTeacherAttendance)

module.exports = router