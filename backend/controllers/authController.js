const supabase = require("../config/supabaseClient")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const login = async (req, res) => {

  const { email, password } = req.body

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single()

  if (!data) {
    return res.status(404).json({ message: "User not found" })
  }

  // Temporary password check
  if (password !== data.password) {
    return res.status(401).json({ message: "Invalid password" })
  }

  const token = jwt.sign(
    { id: data.id, role: data.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  )

  res.json({
    token,
    user: data
  })
}

module.exports = { login }