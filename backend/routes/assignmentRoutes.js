const express = require("express")
const { markAttendance, getTeacherAttendance } = require("../controllers/attendanceController")
const { verifyToken } = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/mark", verifyToken, markAttendance)

router.get("/teacher", verifyToken, getTeacherAttendance)

module.exports = router