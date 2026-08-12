import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { Users, Plus, CreditCard as Edit, Trash2, Check, X, Clock } from "lucide-react";
import API from "../../api/axios";
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../../api/adminApi";

interface UserType {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  roll_number?: string;
  department?: string;
  must_change_password: boolean;
  created_at: string;
}

interface RequestType {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "student" | "teacher";
  roll_number?: string;
  department?: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  rejection_reason?: string;
}

export const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [requests, setRequests] = useState<RequestType[]>([]);
  
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [requestsError, setRequestsError] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [password, setPassword] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Rejection modal state
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Approval success modal
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [approvedEmail, setApprovedEmail] = useState("");

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      setUsersError(err.response?.data?.message || "Failed to load system users.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const { data } = await API.get("/auth/admin/requests");
      setRequests(data);
    } catch (err: any) {
      setRequestsError(err.response?.data?.message || "Failed to load registration requests.");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, []);

  const handleReview = async (id: string, action: "approve" | "reject", reason?: string) => {
    setIsSubmittingReview(true);
    try {
      await API.post(`/auth/admin/requests/${id}/review`, {
        action,
        rejectionReason: reason,
      });

      if (action === "approve") {
        setShowApprovedModal(true);
        const req = requests.find((r) => r.id === id);
        if (req) setApprovedEmail(req.email);
      }

      setRejectingRequestId(null);
      setRejectionReason("");
      
      // Refresh lists
      fetchRequests();
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddOrEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingUser(true);
    try {
      if (editingUser) {
        // Edit User profile fields
        await updateAdminUser(editingUser.id, {
          first_name: firstName,
          last_name: lastName,
          roll_number: role === "student" ? rollNumber : undefined,
          department: role === "teacher" ? department : undefined,
        });
        alert("User updated successfully.");
      } else {
        // Create new user
        await createAdminUser({
          email,
          role,
          first_name: firstName,
          last_name: lastName,
          password: password || undefined,
          roll_number: role === "student" ? rollNumber : undefined,
          department: role === "teacher" ? department : undefined,
        });
        alert("User created successfully.");
      }

      setShowAddModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit user form.");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      await deleteAdminUser(id);
      alert("User deleted successfully.");
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (u: UserType) => {
    setEditingUser(u);
    setFirstName(u.first_name);
    setLastName(u.last_name);
    setEmail(u.email);
    setRole(u.role);
    setRollNumber(u.roll_number || "");
    setDepartment(u.department || "");
    setPassword("");
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("student");
    setPassword("");
    setRollNumber("");
    setDepartment("");
  };

  const columns = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Role",
      accessor: "role",
      render: (value: string) => (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            value === "admin"
              ? "bg-purple-100 text-purple-700"
              : value === "teacher"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      header: "Details",
      accessor: "id",
      render: (_: any, row: UserType) => {
        if (row.role === "student") {
          return <span>Roll: <strong className="text-gray-800">{row.roll_number || "-"}</strong></span>;
        } else if (row.role === "teacher") {
          return <span>Dept: <strong className="text-gray-800">{row.department || "-"}</strong></span>;
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      header: "Actions",
      accessor: "id",
      render: (id: string, row: UserType) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1 text-blue-600 hover:text-blue-700"
            title="Edit User"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(id)}
            className="p-1 text-red-600 hover:text-red-700"
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const students = users.filter((u) => u.role === "student");
  const teachers = users.filter((u) => u.role === "teacher");
  const admins = users.filter((u) => u.role === "admin");
  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">User Management</h1>
            <p className="text-gray-600">Manage institutional users and sign-up approvals</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>

        {/* Counter cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{students.length}</p>
            <p className="text-sm text-gray-600">Students</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{teachers.length}</p>
            <p className="text-sm text-gray-600">Teachers</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{admins.length}</p>
            <p className="text-sm text-gray-600">Admins</p>
          </div>
        </div>

        {/* Admin Sign-up Queue Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">Pending Registration Queue</h2>
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
              {pendingRequests.length} Pending
            </span>
          </div>

          {isLoadingRequests ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading request queue...</div>
          ) : requestsError ? (
            <div className="p-8 text-center text-red-500 text-sm">{requestsError}</div>
          ) : pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No pending registration requests to review.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Details</th>
                    <th className="p-4 font-semibold">Requested At</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">
                          {req.first_name} {req.last_name}
                        </div>
                        <div className="text-xs text-gray-500">{req.email}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            req.role === "teacher"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {req.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-600">
                        {req.role === "student" ? (
                          <span>
                            Roll: <strong className="text-gray-800">{req.roll_number}</strong>
                          </span>
                        ) : (
                          <span>
                            Dept: <strong className="text-gray-800">{req.department}</strong>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(req.requested_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleReview(req.id, "approve")}
                            disabled={isSubmittingReview}
                            className="bg-green-600 text-white p-1.5 rounded-lg hover:bg-green-700 shadow-sm transition disabled:opacity-50"
                            title="Approve & Invite User"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRejectingRequestId(req.id)}
                            disabled={isSubmittingReview}
                            className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 shadow-sm transition disabled:opacity-50"
                            title="Reject Request"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Existing Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All System Users</h2>
          </div>
          {isLoadingUsers ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading user directory...</div>
          ) : usersError ? (
            <div className="p-8 text-center text-red-500 text-sm">{usersError}</div>
          ) : (
            <DataTable columns={columns} data={users} />
          )}
        </div>
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingUser ? "Edit User Profile" : "Add New User"}
      >
        <form onSubmit={handleAddOrEditUserSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              disabled={!!editingUser}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              disabled={!!editingUser}
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password (Optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for auto-generated temporary password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}

          {role === "student" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="e.g. 1DS23CS104"
              />
            </div>
          )}

          {role === "teacher" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="e.g. Computer Science"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingUser}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {isSubmittingUser ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectingRequestId !== null}
        onClose={() => {
          setRejectingRequestId(null);
          setRejectionReason("");
        }}
        title="Reject Registration Request"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Provide an optional reason why this registration request is being rejected.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              rows={3}
              placeholder="e.g. Invalid Roll Number supplied, or details not found in college registry."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setRejectingRequestId(null);
                setRejectionReason("");
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                rejectingRequestId && handleReview(rejectingRequestId, "reject", rejectionReason)
              }
              disabled={isSubmittingReview}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Reject Request
            </button>
          </div>
        </div>
      </Modal>

      {/* Approval Success Modal */}
      <Modal
        isOpen={showApprovedModal}
        onClose={() => {
          setShowApprovedModal(false);
          setApprovedEmail("");
        }}
        title="Request Approved!"
      >
        <div className="space-y-4 text-center py-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2 text-green-600">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Invitation Email Sent</h3>
          <p className="text-sm text-gray-500">
            An invitation email has been sent to <strong className="text-gray-800">{approvedEmail}</strong>.
            They can set up their password using the link sent by Supabase.
          </p>
          <button
            onClick={() => {
              setShowApprovedModal(false);
              setApprovedEmail("");
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition"
          >
            Done
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
