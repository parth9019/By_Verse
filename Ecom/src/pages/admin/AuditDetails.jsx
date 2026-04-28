import { useState, useEffect } from "react";
import api from "../../api/axios";
import { FiActivity, FiClock, FiUser, FiInfo } from "react-icons/fi";

const AuditDetails = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const res = await api.get("/admin/audits");
      setAudits(res.data);
    } catch (error) {
      console.error("Failed to fetch audits");
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    if (action.includes("DELETED") || action.includes("REJECTED")) {
      return "bg-red-50 text-red-600 border-red-100";
    }
    if (action.includes("APPROVED") || action.includes("CREATED") || action.includes("LOGIN")) {
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }
    if (action.includes("UPDATED")) {
      return "bg-amber-50 text-amber-600 border-amber-100";
    }
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 font-medium space-x-3">
        <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span>Loading secure audit logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <FiActivity className="text-indigo-600" /> Platform Audit Logs
          </h1>
          <p className="text-gray-500 font-medium mt-2 max-w-2xl">
            A chronological timeline of critical administrative and system actions. Review platform modifications, approvals, and automated events.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {audits.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            <FiClock className="mx-auto text-4xl mb-4 text-gray-300" />
            No system activity recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Timestamp
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Performed By
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Action Type
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Target
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {audits.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="py-5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <FiClock className="text-gray-400" />
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Performed By */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                          {log.performedBy ? log.performedBy.name.charAt(0).toUpperCase() : <FiInfo />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {log.performedBy ? log.performedBy.name : "System / Unknown"}
                          </p>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {log.performedBy ? log.performedBy.role : "SERVER"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-5 px-6 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getActionBadge(log.action)}`}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="py-5 px-6 whitespace-nowrap">
                      <p className="text-sm font-bold text-gray-700">
                        {log.target || "N/A"}
                      </p>
                    </td>

                    {/* Description */}
                    <td className="py-5 px-6 min-w-[300px]">
                      <p className="text-sm text-gray-600 font-medium">
                        {log.description}
                      </p>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditDetails;
