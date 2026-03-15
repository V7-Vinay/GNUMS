const express = require("express")
const { getTeacherAnalytics } = require("../controllers/analyticsController")
const { verifyToken } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/teacher", verifyToken, getTeacherAnalytics)

module.exports = router