import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { FiFilter, FiStar, FiSearch, FiX } from "react-icons/fi";

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter States
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState("");
  const [sort, setSort] = useState("newest");

  // Mobile Filter Toggle
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = async () => {
    const res = await api.get("/products", {
      params: { 
        q, 
        category, 
        subCategory: subCategory || undefined,
        minPrice: minPrice || undefined, 
        maxPrice: maxPrice || undefined, 
        rating: rating || undefined, 
        sort 
      },
    });
    setProducts(res.data);
  };

  const fetchSubCategories = async () => {
    const res = await api.get("/admin/subcategories");
    setSubCategories(res.data);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500); // 500ms debounce for search inputs to prevent overwhelming API

    return () => clearTimeout(delayDebounceFn);
  }, [q, category, subCategory, minPrice, maxPrice, rating, sort]);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  // Sync with URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryQ = searchParams.get("q");
    const queryCat = searchParams.get("category");
    const querySubCat = searchParams.get("subCategory");
    if (queryQ !== null) setQ(queryQ);
    if (queryCat !== null) setCategory(queryCat);
    if (querySubCat !== null) setSubCategory(querySubCat);
  }, [location.search]);

  const clearFilters = () => {
    setQ("");
    setCategory("");
    setSubCategory("");
    setMinPrice("");
    setMaxPrice("");
    setRating("");
    setSort("newest");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Header Area */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Browse <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-indigo-500">Collection</span>
            </h1>
            <p className="text-gray-500 text-lg">Find the perfect items tailored for your lifestyle.</p>
          </div>

          <div className="flex gap-4 items-center">
            {/* Sort Dropdown */}
            <div className="relative flex items-center bg-white border border-gray-200 hover:border-gray-300 rounded-2xl px-4 py-1.5 shadow-sm transition-all focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-primary-500">
              <span className="text-sm font-medium text-gray-500 mr-2 whitespace-nowrap">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-transparent text-gray-900 py-2 pr-6 font-bold focus:outline-none cursor-pointer text-sm"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="ratingDesc">Highest Rated</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm text-gray-700 font-bold hover:text-primary-600 hover:border-primary-200 transition-colors"
            >
              <FiFilter size={18} /> Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* ================= SIDEBAR FILTERS ================= */}
          <div className={`w-full md:w-72 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <FiFilter className="text-primary-500" /> Filters
                </h2>
                <button onClick={clearFilters} className="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-8">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Search</label>
                <div className="relative group">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-sm font-bold text-gray-900 transition-all placeholder:text-gray-400 placeholder:font-medium"
                  />
                  {q && (
                    <button onClick={() => setQ('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <FiX />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Category</label>
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => { setCategory(""); setSubCategory(""); }}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-between group ${category === "" ? "bg-primary-50 text-primary-700 shadow-xs" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                  >
                    <span>All Products</span>
                    {category === "" && <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>}
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => { setCategory(c._id); setSubCategory(""); }}
                      className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-between group ${category === c._id ? "bg-primary-50 text-primary-700 shadow-xs" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                    >
                      <span className="truncate pr-2">{c.name}</span>
                      {category === c._id && <div className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0"></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* SubCategories (Visible only if Category is selected) */}
              {category && (
                <div className="mb-8">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">SubCategory</label>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => setSubCategory("")}
                      className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-between group ${subCategory === "" ? "bg-primary-50 text-primary-700 shadow-xs" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                    >
                      <span>All SubCategories</span>
                      {subCategory === "" && <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>}
                    </button>
                    {subCategories
                      .filter(sub => sub.category?._id === category || sub.category === category)
                      .map((sub) => (
                      <button
                        key={sub._id}
                        onClick={() => setSubCategory(sub._id)}
                        className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-between group ${subCategory === sub._id ? "bg-primary-50 text-primary-700 shadow-xs" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                      >
                        <span className="truncate pr-2">{sub.name}</span>
                        {subCategory === sub._id && <div className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0"></div>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-8">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Price Range</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-sm font-bold transition-all"
                    />
                  </div>
                  <span className="text-gray-300 font-bold">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-sm font-bold transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Ratings */}
              <div className="mb-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Minimum Rating</label>
                <div className="space-y-1.5">
                  <label className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${rating === "" ? "border-primary-500 bg-primary-50/50" : "border-transparent hover:bg-gray-50"}`}>
                    <input
                      type="radio"
                      name="rating"
                      value=""
                      className="hidden"
                      checked={rating === ""}
                      onChange={() => setRating("")}
                    />
                    <span className={`text-sm font-bold ${rating === "" ? "text-primary-700" : "text-gray-600"}`}>Any Rating</span>
                    {rating === "" && <div className="w-2 h-2 rounded-full bg-primary-600"></div>}
                  </label>
                  {[4, 3, 2, 1].map((star) => (
                    <label key={star} className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${Number(rating) === star ? "border-primary-500 bg-primary-50/50" : "border-transparent hover:bg-gray-50"}`}>
                      <input
                        type="radio"
                        name="rating"
                        value={star}
                        className="hidden"
                        checked={Number(rating) === star}
                        onChange={(e) => setRating(e.target.value)}
                      />
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} size={15} className={i < star ? "fill-amber-400" : "text-gray-200 fill-gray-200"} />
                          ))}
                        </div>
                        <span className={`text-sm font-medium ml-1 ${Number(rating) === star ? "text-primary-700" : "text-gray-500"}`}>& Up</span>
                      </div>
                      {Number(rating) === star && <div className="w-2 h-2 rounded-full bg-primary-600"></div>}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ================= PRODUCT GRID ================= */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="group bg-white border border-gray-100 rounded-3xl p-4 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative flex flex-col"
                >
                  <div className="overflow-hidden rounded-2xl bg-gray-50 aspect-square relative mb-4">
                    <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/5 transition-colors duration-500 z-10" />
                    <img
                      src={p.image || p.images?.[0] || "/placeholder.png"}
                      alt={p.name}
                      className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110 p-4"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-end">
                    <h3 className="font-bold text-gray-900 truncate text-lg">{p.name}</h3>
                    <div className="flex items-center gap-1 text-amber-400 text-sm mt-1 mb-1">
                      <FiStar className="fill-amber-400" />
                      <span className="text-gray-600 font-semibold">{p.rating?.toFixed(1) || "0.0"}</span>
                      <span className="text-gray-400 text-xs">({p.numReviews || 0})</span>
                    </div>
                    <p className="text-gray-900 font-extrabold text-xl tracking-tight">₹{p.price}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {products.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm col-span-full">
                 <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                 <p className="text-gray-500 text-lg">Try adjusting your filters, searching for a different keyword, or clearing filters.</p>
                 <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl font-bold transition-colors">
                   Clear All Filters
                 </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Products;
