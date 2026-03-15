const express = require("express")
const cors = require("cors")
require("dotenv").config()

const authRoutes = require("./routes/authRoutes")
const courseRoutes = require("./routes/courseRoutes")
const assignmentRoutes = require("./routes/assignmentRoutes")
const attendanceRoutes = require("./routes/attendanceRoutes")
const marksRoutes = require("./routes/marksRoutes")
const materialRoutes = require("./routes/materialRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/assignments", assignmentRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/marks", marksRoutes)
app.use("/api/materials", materialRoutes)
app.get("/", (req, res) => {
  res.send("OLMS Backend Running")
})
app.listen(5000, () => {
  console.log("Server running on port 5000")
})