import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import { FiTrash2, FiShoppingCart, FiHeart } from "react-icons/fi";

const Wishlist = () => {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <FiHeart className="text-rose-300 text-4xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm text-center">
          Looks like you haven't added anything to your wishlist yet.
        </p>
        <Link
          to="/"
          className="btn-primary flex items-center gap-2 px-8 py-4 shadow-lg shadow-indigo-500/30"
        >
          Explore Premium Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
        My Wishlist
      </h1>
      <p className="text-gray-500 font-medium mb-10">
        You have {wishlistItems.length} item{wishlistItems.length !== 1 && "s"} saved.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <div
            key={product._id}
            className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
              <Link to={`/product/${product._id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(product._id);
                }}
                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm text-rose-500 hover:text-white hover:bg-rose-500 rounded-full shadow-sm transition-all z-10"
                title="Remove from Wishlist"
              >
                <FiTrash2 size={18} />
              </button>
            </div>

            {/* Content Container */}
            <div className="p-5 flex flex-col flex-1">
              {/* Category & Shop */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md uppercase tracking-wider">
                  {product.category?.name || "Product"}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-[100px]">
                  {product.seller?.shopName}
                </span>
              </div>

              {/* Title */}
              <Link to={`/product/${product._id}`}>
                <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight group-hover:text-primary-600 transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </Link>

              {/* Spacer */}
              <div className="flex-1 mt-2"></div>

              {/* Price & Action */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium mb-0.5">Price</span>
                  <span className="text-xl font-black text-gray-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                </div>

                <button
                  disabled={!product.isActive || product.stock === 0}
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product, 1);
                  }}
                  className={`flex items-center justify-center p-3 rounded-xl transition-all duration-300 shadow-sm ${
                    product.isActive && product.stock > 0
                      ? "bg-gray-900 text-white hover:bg-primary-600 hover:shadow-lg hover:-translate-y-0.5"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  title={product.isActive && product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                >
                  <FiShoppingCart size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist
