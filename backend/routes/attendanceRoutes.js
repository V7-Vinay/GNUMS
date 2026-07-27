const express = require("express")
const { markAttendance } = require("../controllers/attendanceController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/mark", protect, authorize("teacher", "admin"), markAttendance)

module.exports = router