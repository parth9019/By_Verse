import { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../../components/Modal";
import Table from "../../components/Table";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/categories");
      setCategories(res.data);
    } catch (err) {
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.post("/admin/categories", { name });
      setName("");
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Add failed");
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;

    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Categories</h1>
          <p className="text-lg font-medium text-gray-500 mt-2">Manage your product categories.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          + Add Category
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
           <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
           <p className="font-medium">Loading categories...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <Table
            columns={["#", "Category Name"]}
            data={categories}
            renderActions={(cat) => (
              <button
                onClick={() => deleteCategory(cat._id)}
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
        title="Add Category"
      >
        <form onSubmit={addCategory} className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Electronics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium shadow-inner"
            />
          </div>
          <button className="w-full bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            Add Category
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
