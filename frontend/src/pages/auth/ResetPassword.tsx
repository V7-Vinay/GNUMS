import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, AlertCircle, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { changePassword, setUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const exchangeTokens = async () => {
      // Supabase sends tokens in the URL hash fragment (e.g. #access_token=...&refresh_token=...)
      const hash = window.location.hash;
      if (!hash) {
        setError("Invalid or expired password reset link. No token found.");
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setError("Invalid or expired password reset link. Missing session tokens.");
        setIsLoading(false);
        return;
      }

      try {
        // Exchange tokens with backend to set HTTP-only cookies
        const { data } = await API.post("/auth/session-from-tokens", {
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        setUser(data.user);
        setIsAuthenticated(true);
        setMessage("Your email has been verified. Please choose a new secure password for your account.");
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to establish a valid session from the invite link.");
      } finally {
        setIsLoading(false);
      }
    };

    exchangeTokens();
  }, [setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to set new password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-md">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart Portal
          </h1>
          <p className="text-gray-600">
            Institutional Academics Management System
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-50">
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">Verifying invitation credentials...</p>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2 text-green-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Password Configured!</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your password has been successfully configured. You are now logged in and ready to access GNUMS.
              </p>
              <button
                onClick={() => window.location.href = "/"}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition duration-150 shadow-sm text-sm"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              {message && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 font-medium">{message}</p>
                </div>
              )}

              {isAuthenticated && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center mb-4">
                    <Lock className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                    <h2 className="text-xl font-bold text-gray-900">Choose Your Password</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        placeholder="Choose a strong password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        placeholder="Repeat new password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition duration-150 disabled:opacity-50 shadow-sm text-sm"
                  >
                    {isSubmitting ? "Configuring Password..." : "Set Password & Enter Portal"}
                  </button>
                </form>
              )}

              {!isAuthenticated && !isLoading && (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-gray-150 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition text-sm border"
                >
                  Back to Login
                </button>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
