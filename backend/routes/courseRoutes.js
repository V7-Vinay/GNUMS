const express = require("express")
const { getTeacherCourses } = require("../controllers/courseController")
const { verifyToken } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/teacher", verifyToken, getTeacherCourses)

module.exports = router