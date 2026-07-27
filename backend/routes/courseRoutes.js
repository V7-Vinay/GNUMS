const express = require("express")
const { getTeacherCourses } = require("../controllers/courseController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/teacher", protect, authorize("teacher"), getTeacherCourses)

module.exports = router