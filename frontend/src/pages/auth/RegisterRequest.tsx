import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Mail, AlertCircle, User, Award, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

type RoleType = "student" | "teacher";

export const RegisterRequest = () => {
  const navigate = useNavigate();
  const { requestRegistration } = useAuth();

  const [role, setRole] = useState<RoleType | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setError("");
    setIsLoading(true);

    const details: any = {
      first_name: firstName,
      last_name: lastName,
      email,
      role
    };

    if (role === "student") {
      details.roll_number = rollNumber;
    } else if (role === "teacher") {
      details.department = department;
    }

    try {
      await requestRegistration(details);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setIsLoading(false);
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
          
          {/* Back to Login Button */}
          {!isSuccess && (
            <button 
              onClick={() => role ? setRole(null) : navigate("/login")}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {role ? "Change Role" : "Back to Login"}
            </button>
          )}

          {/* Success State */}
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Request Submitted!</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your registration request has been sent to the admin for approval. You'll receive your login credentials via email once approved.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition duration-150 shadow-sm"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <>
              {/* Errors */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              {/* STEP 1: ROLE SELECTION */}
              {!role ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Select Your Role</h2>
                    <p className="text-sm text-gray-500">Choose your academic profile to request portal registration.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setRole("student")}
                      className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition text-center group"
                    >
                      <User className="w-10 h-10 text-gray-400 group-hover:text-blue-600 mb-3" />
                      <span className="font-bold text-gray-800">Student</span>
                      <span className="text-xs text-gray-500 mt-1">Enroll classes, submit grades, view attendance</span>
                    </button>

                    <button
                      onClick={() => setRole("teacher")}
                      className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition text-center group"
                    >
                      <Award className="w-10 h-10 text-gray-400 group-hover:text-blue-600 mb-3" />
                      <span className="font-bold text-gray-800">Teacher</span>
                      <span className="text-xs text-gray-500 mt-1">Track attendance, create assignments, assign grades</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* STEP 2: REGISTRATION FORM */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {role === "student" ? "Student Registration" : "Teacher Registration"}
                    </h2>
                    <p className="text-xs text-gray-500">Provide registration details for review.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Jane"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Personal Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="yourname@gmail.com"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Provide an active email to receive login credentials.</p>
                  </div>

                  {role === "student" ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Roll Number</label>
                      <input
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="e.g. 2026CS1001"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="e.g. Computer Science"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition duration-150 disabled:opacity-50 shadow-sm text-sm"
                  >
                    {isLoading ? "Submitting Request..." : "Submit Registration Request"}
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
