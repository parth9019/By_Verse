import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiTrash2 } from "react-icons/fi";

const ManageSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = async () => {
    try {
      const res = await api.get("/admin/sellers");
      setSellers(res.data);
    } catch (error) {
      console.error("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(
      `⚠️ WARNING: Are you sure you want to permanently delete seller "${name}"?\n\nThis will also DELETE ALL OF THEIR PRODUCTS from the database. This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/sellers/${id}`);
      fetchSellers(); // Refresh list
      alert("Seller and their products have been permanently deleted.");
    } catch (error) {
      alert("Failed to delete seller");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="max-w-6xl space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Manage Sellers
        </h2>
        <p className="text-lg font-medium text-gray-500 mt-2">
          View active sellers and remove their accounts (and products) if necessary.
        </p>
      </div>

      {sellers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-xl font-bold text-gray-900 mb-2">No active sellers</p>
          <p className="text-gray-500 font-medium">There are currently no seller accounts in the system.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 tracking-wider uppercase text-xs">
                    Seller Name
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 tracking-wider uppercase text-xs">
                    Shop Name
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 tracking-wider uppercase text-xs">
                    Joined Date
                  </th>
                  <th className="px-6 py-4 text-right font-bold text-gray-500 tracking-wider uppercase text-xs">
                    Danger Zone
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sellers.map((seller) => (
                  <tr
                    key={seller._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900 text-base">
                        {seller.name}
                      </p>
                      <p className="text-sm font-medium text-gray-500">
                        {seller.email}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-800 rounded-lg font-semibold text-sm">
                        {seller.shopName || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-600">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleDelete(seller._id, seller.name)}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-xl transition-colors shadow-sm"
                        title="Delete Seller Account & Products"
                      >
                        <div className="flex items-center gap-2">
                          <FiTrash2 size={16} /> Delete Seller
                        </div>
                      </button>
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

export default ManageSellers;
