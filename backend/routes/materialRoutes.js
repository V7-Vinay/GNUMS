const express = require("express")
const multer = require("multer")
const { uploadMaterial, getTeacherMaterials } = require("../controllers/materialController")
const { verifyToken } = require("../middleware/authMiddleware")

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post("/upload", verifyToken, upload.single("file"), uploadMaterial)

router.get("/teacher", verifyToken, getTeacherMaterials)

module.exports = router