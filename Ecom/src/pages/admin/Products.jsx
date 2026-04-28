import { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../../components/Modal";
import Table from "../../components/Table";
import { FiX, FiPlus, FiSearch, FiFilter, FiEdit3, FiTrash2, FiImage } from "react-icons/fi";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    subCategory: "",
    status: "active",
  });

  const fetchProducts = async () => {
    const res = await api.get("/admin/products");
    setProducts(res.data);
  };

  const fetchCategories = async () => {
    const res = await api.get("/admin/categories");
    setCategories(res.data);
  };

  const fetchSubCategories = async () => {
    const res = await api.get("/admin/subcategories");
    setSubCategories(res.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ name: "", description: "", price: "", stock: "", category: "", subCategory: "", status: "active" });
    setImage(null);
    setImages([]);
    setPreview(null);
    setIsModalOpen(true);
  };

  const handleImagesChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImages((prev) => {
      const existingNames = new Set(prev.map((f) => f.name + f.size));
      const uniqueNewFiles = newFiles.filter((f) => !existingNames.has(f.name + f.size));
      return [...prev, ...uniqueNewFiles];
    });
    e.target.value = null;
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category?._id,
      subCategory: product.subCategory?._id || "",
      status: product.isActive ? "active" : "inactive",
    });
    setPreview(product.image);
    setImage(null);
    setImages([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.category) {
      alert("Please fill all required fields");
      return;
    }
    if (!editingId && !image) {
      alert("Product image is required");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (image) formData.append("image", image);
      images.forEach((img) => formData.append("images", img));
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, formData);
      } else {
        await api.post("/admin/products", formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/admin/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Products Catalog</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your store's inventory and sellers.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <FiPlus strokeWidth={3} /> Add Product
        </button>
      </div>

      <div className="flex flex-col gap-6">

        {/* Top-Bar Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-2">

          {/* Search Bar */}
          <div className="relative w-full md:flex-1">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search product names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-3.5 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm shadow-sm"
            />
          </div>

          {/* Category Dropdown (Replacing Sidebar List) */}
          <div className="relative w-full md:w-64 shrink-0">
            <FiFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 z-10" size={18} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl pl-12 pr-10 py-3.5 focus:ring-2 focus:ring-indigo-500/20 transition-all font-extrabold text-sm text-indigo-700 shadow-sm appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 text-indigo-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>

        </div>

        {/* Table Wrapper taking full width */}
        <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <Table
            columns={["Product", "Seller", "Price", "Stock", "Status"]}
            data={products.filter((p) => {
              const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesCategory = filterCategory ? (p.category?._id === filterCategory || p.category === filterCategory) : true;
              return matchesSearch && matchesCategory;
            })}
            renderRow={(p) => (
              <>
                <td className="p-5 align-middle">
                  <div className="flex items-center gap-4">
                    <img
                      src={p.image || p.images?.[0] || "/placeholder.png"}
                      alt={p.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] shrink-0 bg-white"
                    />
                    <div className="min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-[280px]">
                      <div className="font-extrabold text-gray-900 leading-tight truncate text-base hover:text-indigo-600 transition-colors cursor-pointer" title={p.name}>{p.name}</div>
                      <div className="text-[10px] font-black tracking-wider text-indigo-400 uppercase mt-1 truncate">
                        {p.category?.name} {p.subCategory ? ` > ${p.subCategory.name}` : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-5 align-middle">
                  {p.seller?.role === "admin" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200">
                      Official
                    </span>
                  ) : (
                    <span className="font-extrabold text-gray-700 text-sm whitespace-nowrap">{p.seller?.name || "By Verse"}</span>
                  )}
                </td>
                <td className="p-5 align-middle">
                  <div className="font-black text-gray-900 text-lg">₹{p.price.toLocaleString()}</div>
                </td>
                <td className="p-5 align-middle">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${p.stock > 10 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : p.stock > 0 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></span>
                    <span className="text-sm font-extrabold text-gray-700">{p.stock} <span className="text-xs text-gray-400 ml-0.5">PCS</span></span>
                    {p.stock <= 5 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">
                        Low Stock
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-5 align-middle">
                  <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${p.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-[0_2px_10px_rgba(16,185,129,0.1)]" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </>
            )}
            renderActions={(p) => (
              <div className="flex items-center gap-3 p-5">
                <button onClick={() => openEditModal(p)} className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 shadow-sm shadow-indigo-100" title="Edit Product">
                  <FiEdit3 size={18} strokeWidth={2.5} />
                </button>
                <button onClick={() => handleDelete(p._id)} className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 shadow-sm shadow-red-100" title="Delete Product">
                  <FiTrash2 size={18} strokeWidth={2.5} />
                </button>
              </div>
            )}
          />
        </div>
      </div>

      {/* Modal is unchanged in logic, only styles refreshed */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Product" : "Add Product"}>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
              <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-medium focus:ring-2 focus:ring-indigo-500/20 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price (₹)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Stock</label>
              <div className="flex items-center gap-1.5 w-full">
                <button type="button" onClick={() => setForm({ ...form, stock: Math.max(0, Number(form.stock || 0) - 10) })} className="w-11 h-12 flex items-center justify-center bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl font-bold transition-all text-xs text-gray-600 shadow-sm shrink-0">-10</button>
                <button type="button" onClick={() => setForm({ ...form, stock: Math.max(0, Number(form.stock || 0) - 1) })} className="w-11 h-12 flex items-center justify-center bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl font-bold transition-all text-lg text-gray-600 shadow-sm shrink-0">-</button>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Math.max(0, e.target.value) })} className="flex-1 min-w-0 bg-white border border-gray-200 shadow-inner rounded-xl px-2 h-12 font-black text-lg text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <button type="button" onClick={() => setForm({ ...form, stock: Number(form.stock || 0) + 1 })} className="w-11 h-12 flex items-center justify-center bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl font-bold transition-all text-lg text-gray-600 shadow-sm shrink-0">+</button>
                <button type="button" onClick={() => setForm({ ...form, stock: Number(form.stock || 0) + 10 })} className="w-11 h-12 flex items-center justify-center bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl font-bold transition-all text-xs text-gray-600 shadow-sm shrink-0">+10</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: "" })} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-indigo-500/20">
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">SubCategory</label>
              <select disabled={!form.category} value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50">
                <option value="">Select SubCategory (Optional)</option>
                {subCategories
                  .filter((sub) => sub.category?._id === form.category || sub.category === form.category)
                  .map((sub) => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-indigo-500/20">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="p-5 bg-gray-50 rounded-3xl border-2 border-solid border-gray-200">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Product Images</label>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Main Cover Image (Required for new products)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => { const file = e.target.files[0]; setImage(file); setPreview(URL.createObjectURL(file)); }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                />
                {preview && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 max-w-[150px]">
                    <img src={preview} alt="preview" className="w-full h-24 object-cover" />
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Additional Images (Optional)</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 transition-all cursor-pointer"
                />
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          className="w-20 h-20 object-cover rounded-xl shadow-sm border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:bg-gray-300">
            {loading ? "Processing..." : editingId ? "Update Product" : "Save Product"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Products;