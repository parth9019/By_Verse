import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiEdit, FiTrash2, FiPlus, FiX, FiBox } from "react-icons/fi";

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  /* Filters */
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

  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      const res = await api.get("/admin/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to load categories");
    }
  };

  /* ================= FETCH SUBCATEGORIES ================= */
  const fetchSubCategories = async () => {
    try {
      const res = await api.get("/admin/subcategories");
      setSubCategories(res.data);
    } catch (error) {
      console.error("Failed to load subcategories");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubCategories();
  }, []);

  /* ================= HANDLE FORM CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= HANDLE MAIN IMAGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= HANDLE EXTRA IMAGES ================= */
  const handleImagesChange = (e) => {
    const newFiles = Array.from(e.target.files);

    setImages((prev) => {
      const existingNames = new Set(prev.map(f => f.name + f.size));
      const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name + f.size));
      return [...prev, ...uniqueNewFiles];
    });

    // Reset input so the same file could be selected again if removed
    e.target.value = null;
  };

  /* ================= REMOVE IMAGE ================= */
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= ADD / EDIT PRODUCT ================= */
  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      // Image is only strictly required for NEW products
      if (!editingId && !image) {
        return alert("Please upload product image");
      }

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category);
      if (form.subCategory) {
        formData.append("subCategory", form.subCategory);
      }
      formData.append("status", form.status);

      /* MAIN IMAGE */
      if (image) {
        formData.append("image", image);
      }

      /* EXTRA IMAGES */
      images.forEach((img) => {
        formData.append("images", img);
      });

      if (editingId) {
        await api.put(`/admin/products/${editingId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("/admin/products", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setShowModal(false);
      setEditingId(null);
      setImage(null);
      setImages([]);
      setPreview(null);

      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        subCategory: "",
        status: "active",
      });

      fetchProducts();

    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product");
    }
  };

  /* ================= HANDLE EDIT CLICK ================= */
  const handleEditClick = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category?._id || product.category,
      subCategory: product.subCategory?._id || product.subCategory || "",
      status: product.isActive ? "active" : "inactive",
    });
    setEditingId(product._id);
    setImage(null);
    setImages([]);
    setPreview(product.image || null);
    setShowModal(true);
  };

  /* ================= DELETE PRODUCT ================= */
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? p.category?._id === filterCategory || p.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Products</h2>
          <p className="text-lg font-medium text-gray-500 mt-2">Manage your catalog, stock, and pricing.</p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setForm({
              name: "",
              description: "",
              price: "",
              stock: "",
              category: "",
              subCategory: "",
              status: "active",
            });
            setImage(null);
            setImages([]);
            setPreview(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          <FiPlus size={20} /> Add Product
        </button>
      </div>

      {/* MAIN CONTENT AREA: SIDEBAR + TABLE */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT SIDEBAR: FILTERS */}
        <div className="w-full lg:w-72 shrink-0 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
          <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Search</label>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-bold transition-all placeholder:text-gray-400 placeholder:font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Category</label>
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => setFilterCategory("")}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-between group ${filterCategory === "" ? "bg-primary-50 text-primary-700 shadow-xs" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                >
                  <span>All Categories</span>
                  {filterCategory === "" && <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>}
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setFilterCategory(c._id)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-between group ${filterCategory === c._id ? "bg-primary-50 text-primary-700 shadow-xs" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                  >
                    <span className="truncate pr-2">{c.name}</span>
                    {filterCategory === c._id && <div className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0"></div>}
                  </button>
                ))}
              </div>
            </div>
            
            {(searchTerm || filterCategory) && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterCategory(''); }}
                className="w-full mt-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl text-sm font-bold transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* RIGHT CONTENT: PRODUCT TABLE */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                 <FiBox className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-lg text-gray-500 font-medium">Click "Add Product" to create your first listing.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No items match your filter</h3>
              <p className="text-lg text-gray-500 font-medium">Try adjusting your search or category fields.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-gray-500 tracking-wider uppercase text-xs">Product</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-500 tracking-wider uppercase text-xs">Price</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-500 tracking-wider uppercase text-xs">Stock</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-500 tracking-wider uppercase text-xs">Status</th>
                      <th className="px-6 py-4 text-right font-bold text-gray-500 tracking-wider uppercase text-xs">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-5 flex items-center gap-4">
                          {product.image || product.images?.[0] ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                              <img
                                src={product.image || product.images?.[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                              <span className="text-gray-400 text-xs text-center">No Img</span>
                            </div>
                          )}
                          <span className="font-bold text-gray-900 text-base">{product.name}</span>
                        </td>

                        <td className="px-6 py-5 font-bold text-gray-700">₹{product.price}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-medium">{product.stock}</span>
                            {product.stock <= 5 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-widest whitespace-nowrap">
                                Low Stock
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          {product.isActive ? (
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase bg-green-100 text-green-700 border border-green-200">
                              Active
                            </span>
                          ) : (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase bg-gray-100 text-gray-600 border border-gray-200">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-right space-x-2 flex items-center justify-end">
                    <button 
                      onClick={() => handleEditClick(product)}
                      className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors group"
                    >
                      <FiEdit size={16} />
                    </button>

                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors group"
                    >
                      <FiTrash2 size={16} />
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
    </div>

    {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 relative overflow-y-auto max-h-[90vh] custom-scrollbar">

            <button
              onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
              }}
              className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-2xl font-extrabold text-gray-900 mb-6">
              {editingId ? "Edit Product" : "Add New Product"}
            </h3>

            <form onSubmit={handleAddProduct} className="space-y-5">

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                 <input
                   type="text"
                   name="name"
                   placeholder="e.g. Handmade Leather Bag"
                   value={form.name}
                   onChange={handleChange}
                   required
                   className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 h-12 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                 />
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                 <textarea
                   name="description"
                   placeholder="Detailed product description..."
                   value={form.description}
                   onChange={handleChange}
                   required
                   rows="3"
                   className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium resize-none"
                 />
              </div>

              <div className="grid grid-cols-2 gap-5">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={form.price}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 h-12 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                    />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity</label>
                    <div className="flex items-center gap-1.5 w-full">
                      <button type="button" onClick={() => setForm({ ...form, stock: Math.max(0, Number(form.stock || 0) - 10) })} className="w-11 h-12 flex items-center justify-center bg-gray-50 hover:bg-primary-50 hover:text-primary-600 rounded-xl font-bold transition-all text-xs text-gray-600 border border-gray-200 shrink-0">-10</button>
                      <button type="button" onClick={() => setForm({ ...form, stock: Math.max(0, Number(form.stock || 0) - 1) })} className="w-11 h-12 flex items-center justify-center bg-gray-50 hover:bg-primary-50 hover:text-primary-600 rounded-xl font-bold transition-all text-lg text-gray-600 border border-gray-200 shrink-0">-</button>
                      <input
                        type="number"
                        name="stock"
                        placeholder="0"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: Math.max(0, e.target.value) })}
                        required
                        className="flex-1 min-w-0 bg-white border border-gray-200 shadow-inner rounded-xl px-2 h-12 font-black text-lg text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button type="button" onClick={() => setForm({ ...form, stock: Number(form.stock || 0) + 1 })} className="w-11 h-12 flex items-center justify-center bg-gray-50 hover:bg-primary-50 hover:text-primary-600 rounded-xl font-bold transition-all text-lg text-gray-600 border border-gray-200 shrink-0">+</button>
                      <button type="button" onClick={() => setForm({ ...form, stock: Number(form.stock || 0) + 10 })} className="w-11 h-12 flex items-center justify-center bg-gray-50 hover:bg-primary-50 hover:text-primary-600 rounded-xl font-bold transition-all text-xs text-gray-600 border border-gray-200 shrink-0">+10</button>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: "" })}
                      required
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 h-12 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">SubCategory</label>
                    <select
                      name="subCategory"
                      value={form.subCategory}
                      disabled={!form.category}
                      onChange={handleChange}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 h-12 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium disabled:opacity-50"
                    >
                      <option value="">Select SubCategory (Optional)</option>
                      {subCategories
                        .filter((sub) => sub.category?._id === form.category || sub.category === form.category)
                        .map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name}
                          </option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 h-12 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                 </div>
              </div>

              {/* IMAGES */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-3">Product Images</label>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Main Cover Image {editingId ? "(Optional)" : "(Required)"}</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!editingId}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Additional Images (Optional)</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {/* MAIN IMAGE PREVIEW */}
                {preview && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 max-w-[200px]">
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                {/* EXTRA IMAGES PREVIEW */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-gray-200">
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

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-lg font-bold text-white bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {editingId ? "Update Product" : "Create Product"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;