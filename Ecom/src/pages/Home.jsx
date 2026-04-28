import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import api from "../api/axios";
import { FiSearch, FiFilter } from "react-icons/fi";

const Home = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchData = async () => {
    try {
      const prodRes = await api.get("/products");
      setAllProducts(prodRes.data);
      
      try {
        const catRes = await api.get("/products/categories");
        setCategories(catRes.data);
      } catch (catErr) {
        console.warn("Could not load categories", catErr);
      }
    } catch (error) {
      console.error("Failed to load home data", error);
      setNetworkError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic
  const isFiltering = searchTerm.trim() !== "" || selectedCategory !== "";
  
  const displayProducts = allProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "" || (p.category?._id || p.category) === selectedCategory;
    return matchSearch && matchCat;
  });

  // To guarantee all categories are completely visible organically without forcing the user to use the manual filters.
  const finalProducts = displayProducts;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="max-w-7xl mx-auto px-4 py-24 sm:py-32 text-gray-900">
        {/* Header & Filters */}
        <div className="flex flex-col mb-12 gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                {isFiltering ? (
                  <>Search <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-indigo-500">Results</span></>
                ) : (
                  <>Featured <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-indigo-500">Products</span></>
                )}
              </h2>
              <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl">
                {isFiltering 
                  ? "Browse the catalog based on your preferences." 
                  : "Handpicked premium items designed to elevate your everyday experience."}
              </p>
            </div>
            {!isFiltering && displayProducts.length > 20 && (
              <button 
                onClick={() => navigate("/products")}
                className="hidden md:inline-flex items-center justify-center font-semibold text-primary-600 bg-primary-50 px-6 py-3 rounded-full hover:bg-primary-100 transition-colors shrink-0"
              >
                View All Collection →
              </button>
            )}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3 lg:w-1/2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-gray-800 outline-none transition-all placeholder:text-gray-400 shadow-sm"
              />
            </div>
            <div className="relative w-full sm:w-48 shrink-0 flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3.5 shadow-sm focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10 transition-all">
               <FiFilter className="text-gray-400 mr-2 shrink-0" />
               <select
                 value={selectedCategory}
                 onChange={(e) => setSelectedCategory(e.target.value)}
                 className="w-full bg-transparent font-bold text-gray-700 outline-none cursor-pointer appearance-none"
               >
                 <option value="">All Categories</option>
                 {categories.map(c => (
                   <option key={c._id} value={c._id}>{c.name}</option>
                 ))}
               </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Loading State */}
          {loading && 
            [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-4 animate-pulse border border-gray-100 shadow-sm"
              >
                <div className="aspect-square bg-gray-100 rounded-2xl mb-5" />
                <div className="h-5 bg-gray-100 rounded-lg w-3/4 mb-3" />
                <div className="h-4 bg-gray-50 rounded-lg w-1/2 mb-5" />
                <div className="flex justify-between items-center mt-4">
                   <div className="h-7 bg-gray-100 rounded-lg w-1/3" />
                   <div className="h-9 bg-gray-100 rounded-xl w-1/4" />
                </div>
              </div>
            ))
          }

          {/* Network Error State */}
          {!loading && networkError && (
            <div className="col-span-full bg-red-50 rounded-3xl shadow-sm p-12 text-center border border-red-100 mt-4">
              <h3 className="text-2xl font-black text-red-900 mb-2">
                Cannot Connect to Database
              </h3>
              <p className="text-red-600 mt-2 font-bold">
                A secure connection to the MongoDB Atlas server could not be established. 
              </p>
              <p className="text-red-500 text-sm mt-3">
                This is usually caused by firewall restrictions, an unstable internet connection, or ISP blocking. Wait a moment and refresh.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !networkError && finalProducts.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl shadow-sm p-16 text-center border border-gray-100 mt-4">
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                No matching products found
              </h3>
              <p className="text-gray-500 mt-2 font-medium">
                Try adjusting your search term or selecting a different category.
              </p>
              {isFiltering && (
                <button 
                  onClick={() => {setSearchTerm(""); setSelectedCategory("");}}
                  className="mt-6 px-6 py-3 bg-primary-50 text-primary-600 font-bold rounded-xl hover:bg-primary-100 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Actual Products */}
          {!loading && !networkError && finalProducts.length > 0 &&
            finalProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          }
        </div>
      </section>
    </div>
  );
};

export default Home;
