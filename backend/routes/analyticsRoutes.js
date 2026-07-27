const express = require("express")
const { getTeacherAnalytics } = require("../controllers/analyticsController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/teacher", protect, authorize("teacher"), getTeacherAnalytics)

module.exports = router