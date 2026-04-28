import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { FiHeart, FiStar, FiCheck, FiShield, FiRefreshCcw } from "react-icons/fi";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);

        const productData = res.data;

        setProduct(productData);

        /* SAFE IMAGE HANDLING */
        let galleryImages = [];
        if (productData.image) galleryImages.push(productData.image);
        if (productData.images && productData.images.length > 0) {
           galleryImages = [...galleryImages, ...productData.images];
        }

        // Remove duplicates
        galleryImages = Array.from(new Set(galleryImages));

        if (galleryImages.length === 0) galleryImages.push("/placeholder.png");

        setSelectedImage(galleryImages[0]);
      } catch (err) {
        console.error("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to submit a review");
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating: userRating, comment: userComment });
      alert("Review added successfully!");
      // Refetch product
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
      setUserComment("");
      setUserRating(5);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-20 text-center text-gray-500">
          Loading product details...
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="p-20 text-center text-gray-500">
          Product not found
        </div>
      </>
    );
  }

  const inStock = product.stock > 0;
  const isWishlisted = isInWishlist(product._id);
  const userId = user?.id || user?._id;
  const hasReviewed = user && product.reviews?.some(r => r.user === userId || r.user?._id === userId);

  let gallery = [];
  if (product.image) gallery.push(product.image);
  if (product.images && product.images.length > 0) {
    gallery = [...gallery, ...product.images];
  }

  // Robust Deduplication: Extract filename from URL to ignore protocol/domain differences
  const uniqueGalleryMap = new Map();
  gallery.forEach(url => {
    if (!url) return;
    try {
      // Split by '?' to remove query params, then get the last part separated by '/'
      const cleanUrl = url.split('?')[0];
      const parts = cleanUrl.split('/');
      const filename = parts[parts.length - 1]; // e.g. "image_id.jpg"
      
      if (!uniqueGalleryMap.has(filename)) {
        uniqueGalleryMap.set(filename, url);
      }
    } catch (e) {
      uniqueGalleryMap.set(url, url); // Fallback
    }
  });
  
  gallery = Array.from(uniqueGalleryMap.values());

  if (gallery.length === 0) gallery.push("/placeholder.png");

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 xl:px-0 auto-rows-max">
          
          {/* ================= TOP GRID: MAIN INFO ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* 1. LEFT: IMAGE GALLERY (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center p-6 aspect-square relative">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 z-10"
                >
                  <FiHeart size={24} className={isWishlisted ? "fill-rose-500 text-rose-500" : ""} />
                </button>
              </div>
              
              {gallery.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {gallery.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`shrink-0 h-20 w-20 rounded-xl overflow-hidden border-2 transition-all duration-300 bg-white
                        ${selectedImage === img ? "border-primary-500 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}
                      `}
                    >
                      <img src={img} alt="" className="h-full w-full object-contain mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. MIDDLE: PRODUCT INFO (4 cols) */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              <div className="border-b border-gray-100 pb-4 space-y-2">
                
                <div className="flex items-center gap-2 text-xs font-black tracking-widest text-indigo-400 uppercase mb-1">
                  <span className="cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => navigate(`/products?category=${product.category?._id}`)}>{product.category?.name}</span>
                  {product.subCategory && (
                    <>
                      <span>{'>'}</span>
                      <span className="cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => navigate(`/products?category=${product.category?._id}&subCategory=${product.subCategory?._id}`)}>{product.subCategory.name}</span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <p className="text-sm text-indigo-600 font-medium hover:underline cursor-pointer w-fit" onClick={() => product.seller?._id && navigate(`/seller/${product.seller._id}`)}>
                  Visit the {product.seller?.shopName || "Store"}
                </p>
                
                {/* RATING */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <FiStar key={star} className={star <= Math.round(product.rating || 0) ? "fill-amber-400" : "fill-gray-200 text-gray-200"} />
                    ))}
                  </div>
                  <span className="font-semibold text-primary-600">{product.rating?.toFixed(1) || 0}</span>
                  <span>({product.numReviews || 0} ratings)</span>
                </div>
              </div>

              <div className="py-2">
                <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-extrabold text-gray-900">₹{product.price.toLocaleString()}</p>
                </div>
                <p className="text-sm text-gray-500">Inclusive of all taxes</p>
              </div>

              {/* FEATURES / HIGHLIGHTS */}
              <div className="space-y-3 py-4 border-y border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-700 font-medium"><FiCheck className="text-green-500" size={18} /> Top Brand Quality</div>
                <div className="flex items-center gap-3 text-sm text-gray-700 font-medium"><FiShield className="text-primary-500" size={18} /> 1 Year Warranty</div>
                <div className="flex items-center gap-3 text-sm text-gray-700 font-medium"><FiRefreshCcw className="text-indigo-500" size={18} /> 14 Days Return Policy</div>
              </div>

              {/* DESC */}
              <div className="pt-2">
                <h3 className="font-bold text-gray-900 mb-2">About this item</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* 3. RIGHT: SELL BOX (3 cols) */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
                <p className="text-3xl font-extrabold text-gray-900 mb-4">₹{product.price.toLocaleString()}</p>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-medium">Delivery by <span className="text-gray-900 font-bold">Tomorrow</span></p>
                  <p className="text-xs text-primary-600 mt-1">If ordered within 2 hrs</p>
                </div>

                <p className={`text-lg font-bold mb-4 ${inStock ? "text-green-600" : "text-red-600"}`}>
                  {inStock ? "In Stock" : "Out of Stock"}
                </p>

                {inStock && (
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Quantity:</label>
                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-900 cursor-pointer transition-all"
                    >
                      {[...Array(Math.min(product.stock, 5)).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={() => addToCart(product, qty)}
                    disabled={!inStock}
                    className={`w-full py-3.5 rounded-full text-sm font-bold shadow-md transition-all duration-300 
                      ${inStock ? "bg-amber-400 hover:bg-amber-500 text-gray-900" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                        addToCart(product, qty);
                        navigate('/checkout'); // Optional: Buy Now takes to checkout
                    }}
                    disabled={!inStock}
                    className={`w-full py-3.5 rounded-full text-sm font-bold shadow-md transition-all duration-300
                      ${inStock ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                  >
                    Buy Now
                  </button>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => toggleWishlist(product._id)}
                    className="w-full text-left flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <FiHeart className={isWishlisted ? "fill-rose-500 text-rose-500" : ""} /> {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  </button>
                </div>
              </div>
            </div>
            
          </div>

          {/* ================= BOTTOM GRID: REVIEWS ================= */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Customer Reviews</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              
              {/* REVIEWS SUMMARY & WRITE REVIEW */}
              <div className="md:col-span-1 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl font-black text-gray-900">{product.rating?.toFixed(1) || 0}</span>
                    <span className="text-xl text-gray-500 font-medium">out of 5</span>
                  </div>
                  <p className="text-sm text-gray-500">{product.numReviews} global ratings</p>
                </div>
                
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Review this product</h3>
                  <p className="text-sm text-gray-500 mb-4">Share your thoughts with other customers</p>
                  
                  {!user ? (
                    <button onClick={() => navigate('/login')} className="w-full py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                      Log in to write a review
                    </button>
                  ) : hasReviewed ? (
                     <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium text-center border border-green-100">
                        You have already reviewed this product.
                     </div>
                  ) : (
                    <form onSubmit={submitReview} className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Rating</label>
                        <select 
                          value={userRating} 
                          onChange={(e)=>setUserRating(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                          <option value="4">⭐⭐⭐⭐ - Good</option>
                          <option value="3">⭐⭐⭐ - Ok</option>
                          <option value="2">⭐⭐ - Poor</option>
                          <option value="1">⭐ - Terrible</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Comment</label>
                        <textarea
                          required
                          rows="3"
                          value={userComment}
                          onChange={(e)=>setUserComment(e.target.value)}
                          placeholder="What did you like or dislike?"
                          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                        ></textarea>
                      </div>
                      <button disabled={submittingReview} type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* REVIEWS LIST */}
              <div className="md:col-span-2 space-y-8">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                          {rev.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{rev.name}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] sm:text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200 uppercase tracking-wider shadow-sm">
                            <FiCheck size={12} strokeWidth={3} /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                         <div className="flex text-amber-400 text-sm">
                          {[1, 2, 3, 4, 5].map(star => (
                            <FiStar key={star} className={star <= rev.rating ? "fill-amber-400" : "fill-gray-200 text-gray-200"} />
                          ))}
                         </div>
                         <span className="text-xs text-gray-400 font-medium">
                           {new Date(rev.createdAt).toLocaleDateString()}
                         </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-gray-500 italic">No customer reviews yet.</p>
                  </div>
                )}
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProductDetails;