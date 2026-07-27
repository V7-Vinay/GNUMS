const express = require("express")
const { addMarks, getTeacherMarks } = require("../controllers/marksController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/add", protect, authorize("teacher"), addMarks)

router.get("/teacher", protect, authorize("teacher"), getTeacherMarks)

module.exports = router