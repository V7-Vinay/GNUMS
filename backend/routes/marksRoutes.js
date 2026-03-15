const express = require("express")
const { addMarks, getTeacherMarks } = require("../controllers/marksController")
const { verifyToken } = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/add", verifyToken, addMarks)

router.get("/teacher", verifyToken, getTeacherMarks)

module.exports = router