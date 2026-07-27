import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { users as mockUsers } from '../../data/mockData';
import { Users, Plus, CreditCard as Edit, Trash2, Check, X, Clock } from 'lucide-react';
import API from '../../api/axios';

interface RequestType {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'student' | 'teacher';
  roll_number?: string;
  department?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  rejection_reason?: string;
}

export const AdminUserManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState("");
  
  // Rejection modal state
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Approval success modal
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [approvedEmail, setApprovedEmail] = useState("");

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
    fetchRequests();
  }, []);

  const handleReview = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    setIsSubmittingReview(true);
    try {
      await API.post(`/auth/admin/requests/${id}/review`, {
        action,
        rejectionReason: reason
      });
      
      if (action === 'approve') {
        setShowApprovedModal(true);
        // Find email for display
        const req = requests.find(r => r.id === id);
        if (req) setApprovedEmail(req.email);
      }
      
      // Close rejection modal if open
      setRejectingRequestId(null);
      setRejectionReason("");
      
      // Reload lists
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (value: string) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
          value === 'admin' ? 'bg-purple-100 text-purple-700' :
          value === 'teacher' ? 'bg-blue-100 text-blue-700' :
          'bg-green-100 text-green-700'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: () => (
        <div className="flex items-center space-x-2">
          <button className="p-1 text-blue-600 hover:text-blue-700">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1 text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const students = mockUsers.filter((u) => u.role === 'student');
  const teachers = mockUsers.filter((u) => u.role === 'teacher');
  const admins = mockUsers.filter((u) => u.role === 'admin');

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">User Management</h1>
            <p className="text-gray-600">Manage institutional users and sign-up approvals</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
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
            <div className="p-8 text-center text-gray-500 text-sm">No pending registration requests to review.</div>
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
                        <div className="font-semibold text-gray-900">{req.first_name} {req.last_name}</div>
                        <div className="text-xs text-gray-500">{req.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          req.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {req.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-600">
                        {req.role === 'student' ? (
                          <span>Roll: <strong className="text-gray-800">{req.roll_number}</strong></span>
                        ) : (
                          <span>Dept: <strong className="text-gray-800">{req.department}</strong></span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(req.requested_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleReview(req.id, 'approve')}
                            disabled={isSubmittingReview}
                            className="bg-green-600 text-white p-1.5 rounded-lg hover:bg-green-700 shadow-sm transition disabled:opacity-50"
                            title="Approve & Generate Password"
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
          <DataTable columns={columns} data={mockUsers} />
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </form>
      </Modal>

      {/* Rejection Modal */}
      <Modal 
        isOpen={rejectingRequestId !== null} 
        onClose={() => { setRejectingRequestId(null); setRejectionReason(""); }} 
        title="Reject Registration Request"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Provide an optional reason why this registration request is being rejected.</p>
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
              onClick={() => { setRejectingRequestId(null); setRejectionReason(""); }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => rejectingRequestId && handleReview(rejectingRequestId, 'reject', rejectionReason)}
              disabled={isSubmittingReview}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Reject Request
            </button>
          </div>
        </div>
      </Modal>

      {/* Approval Success Modal (Informed invite sent) */}
      <Modal
        isOpen={showApprovedModal}
        onClose={() => { setShowApprovedModal(false); setApprovedEmail(""); }}
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
            onClick={() => { setShowApprovedModal(false); setApprovedEmail(""); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition"
          >
            Done
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
