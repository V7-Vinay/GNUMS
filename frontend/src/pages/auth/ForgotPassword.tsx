import { useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState<
    "email" | "otp" | "password" | "done"
  >("email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    /* STEP 1 : SEND OTP */

    if (step === "email") {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
      });

      setIsLoading(false);

      if (error) {
        setError(error.message);
      } else {
        setStep("otp");
      }
    }

    /* STEP 2 : VERIFY OTP */

    else if (step === "otp") {
      setIsLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: "email",
      });

      setIsLoading(false);

      if (error || !data.user) {
        setError("Invalid OTP. Please try again.");
      } else {
        setStep("password");
      }
    }

    /* STEP 3 : UPDATE PASSWORD */

    else if (step === "password") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setIsLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      setIsLoading(false);

      if (error) {
        setError(error.message);
      } else {
        setStep("done");
      }
    }
  };

  /* DONE SCREEN */

  if (step === "done") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">

          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Password Reset!
          </h1>

          <p className="text-gray-600 mb-6">
            Your password has been updated successfully.
          </p>

          <Link
            to="/login"
            className="w-full block bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Back to Login
          </Link>

        </div>
      </div>
    );
  }

  const stepLabels = ["Enter Email", "Verify OTP", "New Password"];
  const currentStep =
    step === "email" ? 0 : step === "otp" ? 1 : 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* HEADER */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h1>

          <p className="text-gray-600">
            Reset your password securely
          </p>

        </div>

        {/* STEP INDICATOR */}

        <div className="flex justify-center mb-6 space-x-2">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center">

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${
                  i <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>

              {i < stepLabels.length - 1 && (
                <div className="w-10 h-0.5 bg-gray-200 mx-2" />
              )}

            </div>
          ))}
        </div>

        {/* FORM */}

        <div className="bg-white rounded-xl shadow-lg p-8">

          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* EMAIL */}

            {step === "email" && (
              <>
                <div>

                  <label className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>

                  <div className="relative mt-1">

                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 py-3 border rounded-lg"
                      placeholder="you@example.com"
                    />

                  </div>

                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            )}

            {/* OTP */}

            {step === "otp" && (
              <>
                <div className="text-center mb-2">
                  <ShieldCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Enter the OTP sent to <b>{email}</b>
                  </p>
                </div>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full py-3 border rounded-lg text-center tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-sm text-gray-500 w-full"
                >
                  Change Email
                </button>
              </>
            )}

            {/* PASSWORD */}

            {step === "password" && (
              <>
                <div>

                  <label className="text-sm font-medium text-gray-700">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-1 py-3 px-3 border rounded-lg"
                    required
                  />

                </div>

                <div>

                  <label className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="w-full mt-1 py-3 px-3 border rounded-lg"
                    required
                  />

                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  {isLoading ? "Updating..." : "Reset Password"}
                </button>
              </>
            )}

          </form>

          {step === "email" && (
            <Link
              to="/login"
              className="mt-6 flex items-center justify-center text-sm text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          )}

        </div>
      </div>
    </div>
  );
};