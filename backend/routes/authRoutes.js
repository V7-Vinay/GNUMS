const express = require("express")
const { 
  requestRegistration, 
  login, 
  changePassword, 
  logout, 
  getMe, 
  getPendingRequests, 
  reviewRequest,
  setSessionFromTokens
} = require("../controllers/authController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/request-registration", requestRegistration)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", protect, getMe)

router.post("/change-password", protect, changePassword)
router.post("/session-from-tokens", setSessionFromTokens)

// Admin Actions
router.get("/admin/requests", protect, authorize("admin"), getPendingRequests)
router.post("/admin/requests/:id/review", protect, authorize("admin"), reviewRequest)

module.exports = router