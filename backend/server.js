const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require("dotenv").config()

const authRoutes = require("./routes/authRoutes")
const courseRoutes = require("./routes/courseRoutes")
const assignmentRoutes = require("./routes/assignmentRoutes")
const attendanceRoutes = require("./routes/attendanceRoutes")
const marksRoutes = require("./routes/marksRoutes")
const materialRoutes = require("./routes/materialRoutes")
const analyticsRoutes = require("./routes/analyticsRoutes")
const app = express()
const studentRoutes = require("./routes/student/studentRoutes")

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())


app.use("/api/auth", authRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/assignments", assignmentRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/marks", marksRoutes)
app.use("/api/materials", materialRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/student", studentRoutes)

app.get("/", (req, res) => {
  res.send("OLMS Backend Running")
})
app.listen(5000, () => {
  console.log("Server running on port 5000")
})