const supabase = require("../config/supabaseClient")

// User submits registration request
const requestRegistration = async (req, res) => {
  try {
    const { first_name, last_name, email, role, roll_number, department } = req.body

    if (!first_name || !last_name || !email || !role) {
      return res.status(400).json({ message: "First name, last name, email, and role are required." })
    }

    const cleanEmail = email.trim().toLowerCase()
    const validRoles = ["student", "teacher"]
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected." })
    }

    if (role === "student" && !roll_number) {
      return res.status(400).json({ message: "Roll number is required for students." })
    }

    if (role === "teacher" && !department) {
      return res.status(400).json({ message: "Department is required for teachers." })
    }

    // Check if email already has an active account
    const { data: activeUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle()

    if (activeUser) {
      return res.status(400).json({ message: "An account with this email is already registered and active." })
    }

    // Check if there is already a pending request
    const { data: pendingRequest } = await supabase
      .from("registration_requests")
      .select("id")
      .eq("email", cleanEmail)
      .eq("status", "pending")
      .maybeSingle()

    if (pendingRequest) {
      return res.status(400).json({ message: "A pending registration request already exists for this email." })
    }

    // Insert request
    const { data, error } = await supabase
      .from("registration_requests")
      .insert([
        {
          first_name,
          last_name,
          email: cleanEmail,
          role,
          roll_number: role === "student" ? roll_number : null,
          department: role === "teacher" ? department : null,
          status: "pending"
        }
      ])
      .select()

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    res.status(201).json({
      message: "Your registration request has been sent to the admin for approval. You'll receive your login credentials via email once approved."
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// User login (via email + password)
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Sign in using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    })

    if (authError) {
      console.error("[AUTH] Auth error:", authError);
      return res.status(401).json({ message: "Invalid email or password." })
    }

    const { session, user } = authData
    console.log("[AUTH] Logged in auth user id:", user.id);

    // Fetch user profile from public.users with their role name
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*, roles(name)")
      .eq("id", user.id)
      .single()

    if (profileError || !userProfile) {
      console.error("[AUTH] Profile lookup failed. error:", profileError, "profile:", userProfile);
      return res.status(404).json({ message: "User profile not found in database." })
    }

    // Set secure httpOnly cookies
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

    const mappedUser = {
      id: userProfile.id,
      email: userProfile.email,
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      role: userProfile.roles.name,
      must_change_password: userProfile.must_change_password
    }

    return res.json({
      message: "Logged in successfully.",
      mustChangePassword: userProfile.must_change_password,
      user: mappedUser
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// User changes password (for first login force-change)
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body
    const userId = req.user.id

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." })
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      return res.status(500).json({ message: updateError.message })
    }

    // Clear must_change_password flag in public.users table
    const { error: dbError } = await supabase
      .from("users")
      .update({ must_change_password: false })
      .eq("id", userId)

    if (dbError) {
      return res.status(500).json({ message: dbError.message })
    }

    res.json({ message: "Password updated successfully. You can now access your portal." })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Logout
const logout = async (req, res) => {
  try {
    res.clearCookie("access_token")
    res.clearCookie("refresh_token")
    await supabase.auth.signOut()
    return res.json({ message: "Logged out successfully." })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get Logged In User Profile
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    return res.json({ user: req.user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ADMIN: Get all registration requests
const getPendingRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("registration_requests")
      .select("*")
      .order("status", { ascending: true }) // 'approved', 'pending', 'rejected'
      .order("requested_at", { ascending: false })

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ADMIN: Approve or Reject request
const reviewRequest = async (req, res) => {
  try {
    const { id } = req.params
    const { action, rejectionReason } = req.body
    const adminId = req.user.id

    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'." })
    }

    // Fetch the request
    const { data: request, error: findError } = await supabase
      .from("registration_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (findError || !request) {
      return res.status(404).json({ message: "Registration request not found." })
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request has already been ${request.status}.` })
    }

    if (action === "reject") {
      const { data, error } = await supabase
        .from("registration_requests")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason || "No reason specified.",
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()

      if (error) {
        return res.status(500).json({ message: error.message })
      }

      return res.json({ message: "Registration request rejected successfully.", data: data[0] })
    }

    // If approve, invite user via Supabase Auth email invite flow
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(request.email, {
      redirectTo: 'http://localhost:5173/reset-password',
      data: {
        first_name: request.first_name,
        last_name: request.last_name,
        role: request.role,
        roll_number: request.roll_number,
        department: request.department
      }
    })

    if (inviteError) {
      return res.status(500).json({ message: "Failed to invite user: " + inviteError.message })
    }

    // Update request
    const { data, error: updateError } = await supabase
      .from("registration_requests")
      .update({
        status: "approved",
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()

    if (updateError) {
      return res.status(500).json({ message: "User invited, but request status update failed: " + updateError.message })
    }

    res.json({
      message: "Registration request approved successfully. Invitation email sent.",
      data: data[0]
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Set Session From Tokens (used by reset password link redirection)
const setSessionFromTokens = async (req, res) => {
  try {
    const { access_token, refresh_token } = req.body
    if (!access_token || !refresh_token) {
      return res.status(400).json({ message: "Tokens are required." })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(access_token)
    if (userError || !user) {
      return res.status(401).json({ message: "Invalid or expired access token." })
    }

    // Fetch user profile from public.users with their role name
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*, roles(name)")
      .eq("id", user.id)
      .single()

    if (profileError || !userProfile) {
      return res.status(404).json({ message: "User profile not found in database." })
    }

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    }

    res.cookie("access_token", access_token, {
      ...cookieOptions,
      maxAge: 3600 * 1000 // 1 hour
    })

    res.cookie("refresh_token", refresh_token, {
      ...cookieOptions,
      maxAge: 30 * 24 * 3600 * 1000 // 30 days
    })

    const mappedUser = {
      id: userProfile.id,
      email: userProfile.email,
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      role: userProfile.roles.name,
      must_change_password: userProfile.must_change_password
    }

    res.json({ user: mappedUser })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  requestRegistration,
  login,
  changePassword,
  logout,
  getMe,
  getPendingRequests,
  reviewRequest,
  setSessionFromTokens
}