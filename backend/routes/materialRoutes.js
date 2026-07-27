const express = require("express")
const multer = require("multer")
const { uploadMaterial, getTeacherMaterials } = require("../controllers/materialController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post("/upload", protect, authorize("teacher"), upload.single("file"), uploadMaterial)

router.get("/teacher", protect, authorize("teacher"), getTeacherMaterials)

module.exports = router