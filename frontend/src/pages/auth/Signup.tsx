import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export const Signup = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student" as "student" | "parent",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    /* ---------------- STEP 1 : SEND OTP ---------------- */

    if (step === "email") {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
      });

      setLoading(false);

      if (error) {
        setError(error.message);
      } else {
        setStep("otp");
      }
    }

    /* ---------------- STEP 2 : VERIFY OTP ---------------- */

    else if (step === "otp") {
      setLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otp,
        type: "email",
      });

      setLoading(false);

      if (error || !data.user) {
        setError("Invalid OTP");
      } else {
        setStep("password");
      }
    }

    /* ---------------- STEP 3 : CREATE ACCOUNT ---------------- */

    else if (step === "password") {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setLoading(true);

      const { error: passwordError } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (passwordError) {
        setError(passwordError.message);
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();

      const { error: dbError } = await supabase.from("users").insert({
        id: userData.user?.id,
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });

      setLoading(false);

      if (dbError) {
        setError(dbError.message);
        return;
      }

      navigate(`/${formData.role}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-white w-8 h-8" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600">Join our platform</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">

          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex space-x-3">
                <AlertCircle className="text-red-600 w-5 h-5 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* STEP 1 */}

            {step === "email" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-10 py-3 border rounded-lg"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 py-3 border rounded-lg"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            )}

            {/* STEP 2 */}

            {step === "otp" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Enter OTP
                  </label>

                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full mt-1 py-3 px-3 border rounded-lg text-center tracking-widest"
                    placeholder="123456"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}

            {/* STEP 3 */}

            {step === "password" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full pl-10 pr-10 py-3 border rounded-lg"
                      autoComplete="new-password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>

                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-10 py-3 border rounded-lg"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </>
            )}

          </form>

          <p className="text-center text-sm mt-6 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};