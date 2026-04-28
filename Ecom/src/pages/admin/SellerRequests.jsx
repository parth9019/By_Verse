import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiCheck, FiX } from "react-icons/fi";

const SellerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/admin/seller-requests");
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to load seller requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this seller?")) return;

    try {
      await api.put(`/admin/seller-requests/${id}/approve`);
      fetchRequests();
    } catch {
      alert("Approval failed");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this seller?")) return;

    try {
      await api.put(`/admin/seller-requests/${id}/reject`);
      fetchRequests();
    } catch {
      alert("Rejection failed");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="max-w-6xl space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Seller Requests</h2>
        <p className="text-lg font-medium text-gray-500 mt-2">Manage applications from users wanting to become sellers.</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <FiCheck className="text-4xl text-gray-300" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">All caught up!</p>
          <p className="text-gray-500 font-medium">No pending seller applications found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 tracking-wider uppercase text-xs">Applicant</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 tracking-wider uppercase text-xs">Shop Details</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 tracking-wider uppercase text-xs">GSTIN</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 tracking-wider uppercase text-xs">Status</th>
                  <th className="px-6 py-4 text-right font-bold text-gray-500 tracking-wider uppercase text-xs">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900 text-base">{req.user?.name}</p>
                      <p className="text-sm font-medium text-gray-500">
                        {req.user?.email}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                        <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-800 rounded-lg font-semibold text-sm">
                          {req.shopName}
                        </span>
                    </td>
                    <td className="px-6 py-5 font-mono text-gray-600 text-sm">{req.gstNumber}</td>

                    <td className="px-6 py-5">
                      {req.status === "pending" && (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase bg-yellow-100 text-yellow-700 border border-yellow-200">
                          Pending
                        </span>
                      )}
                      {req.status === "approved" && (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase bg-green-100 text-green-700 border border-green-200">
                          Approved
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase bg-red-100 text-red-700 border border-red-200">
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-right">
                      {req.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req._id)}
                            className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors group relative"
                            title="Approve"
                          >
                            <FiCheck size={20} />
                          </button>

                          <button
                            onClick={() => handleReject(req._id)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors group relative"
                            title="Reject"
                          >
                            <FiX size={20} />
                          </button>
                        </div>
                      )}
                      {req.status !== "pending" && (
                        <span className="text-sm text-gray-400 font-medium">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerRequests;
