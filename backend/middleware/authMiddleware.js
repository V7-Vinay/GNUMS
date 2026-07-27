const supabase = require("../config/supabaseClient")

// Protect Routes Middleware
const protect = async (req, res, next) => {
  let accessToken = req.cookies.access_token
  let refreshToken = req.cookies.refresh_token

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ message: "Not authorized, no session found." })
  }

  const attachUser = async (userId) => {
    const { data: userProfile, error } = await supabase
      .from("users")
      .select("*, roles(name)")
      .eq("id", userId)
      .single()

    if (error || !userProfile) {
      return null
    }

    return {
      id: userProfile.id,
      email: userProfile.email,
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      role: userProfile.roles.name,
      must_change_password: userProfile.must_change_password
    }
  }

  try {
    if (accessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken)

      if (!error && user) {
        const attached = await attachUser(user.id)
        if (attached) {
          req.user = attached
          
          // Force password change check
          // Bypass check for /change-password, /logout, and /me
          const isBypassRoute = req.path === "/change-password" || req.path === "/logout" || req.path === "/me"
          if (req.user.must_change_password && !isBypassRoute) {
            return res.status(403).json({
              code: "FORCE_PASSWORD_CHANGE",
              message: "You must change your temporary password before accessing the portal."
            })
          }
          
          return next()
        }
      }
    }

    // Access token invalid/expired -> Attempt silent refresh
    if (refreshToken) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      })

      if (!refreshError && refreshData.session) {
        const { session, user } = refreshData

        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        }

        res.cookie("access_token", session.access_token, {
          ...cookieOptions,
          maxAge: 3600 * 1000 // 1 hour
        })

        res.cookie("refresh_token", session.refresh_token, {
          ...cookieOptions,
          maxAge: 30 * 24 * 3600 * 1000 // 30 days
        })

        const attached = await attachUser(user.id)
        if (attached) {
          req.user = attached
          
          const isBypassRoute = req.path === "/change-password" || req.path === "/logout" || req.path === "/me"
          if (req.user.must_change_password && !isBypassRoute) {
            return res.status(403).json({
              code: "FORCE_PASSWORD_CHANGE",
              message: "You must change your temporary password before accessing the portal."
            })
          }
          
          return next()
        }
      }
    }

    res.clearCookie("access_token")
    res.clearCookie("refresh_token")
    return res.status(401).json({ message: "Session expired or invalid. Please log in again." })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// Role Authorization Middleware (RBAC)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`
      })
    }

    next()
  }
}

module.exports = { protect, authorize }