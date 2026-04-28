import { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../../components/Modal";
import Table from "../../components/Table";

const SubCategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, catRes] = await Promise.all([
        api.get("/admin/subcategories"),
        api.get("/admin/categories")
      ]);
      setSubCategories(subRes.data);
      setCategories(catRes.data);
    } catch (err) {
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const addSubCategory = async (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    try {
      await api.post("/admin/subcategories", { name, category: categoryId });
      setName("");
      setCategoryId("");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Add failed");
    }
  };

  const deleteSubCategory = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;

    try {
      await api.delete(`/admin/subcategories/${id}`);
      fetchData();
    } catch {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">SubCategories</h1>
          <p className="text-lg font-medium text-gray-500 mt-2">Manage your product subcategories.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          + Add SubCategory
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
           <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
           <p className="font-medium">Loading...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <Table
            columns={["#", "SubCategory Name", "Parent Category"]}
            data={subCategories}
            renderRow={(sub, index) => (
              <>
                <td className="p-4">{index + 1}</td>
                <td className="p-4 font-bold text-gray-900">{sub.name}</td>
                <td className="p-4 font-medium text-gray-600">
                  {sub.category ? sub.category.name : "Unknown"}
                </td>
              </>
            )}
            renderActions={(sub) => (
              <button
                onClick={() => deleteSubCategory(sub._id)}
                className="inline-flex items-center gap-1 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
          />
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add SubCategory"
      >
        <form onSubmit={addSubCategory} className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">SubCategory Name</label>
            <input
              type="text"
              placeholder="e.g. Laptops"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium shadow-inner"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Parent Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium shadow-inner"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <button className="w-full bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            Add SubCategory
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SubCategories;
