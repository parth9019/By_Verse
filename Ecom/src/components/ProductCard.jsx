import { useNavigate } from "react-router-dom";
import { FiStar } from "react-icons/fi";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleSellerClick = (e) => {
    e.stopPropagation();

    // 🔒 Only navigate if seller exists
    if (product.seller?._id) {
      navigate(`/seller/${product.seller._id}`);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group bg-white border border-gray-100 rounded-3xl p-4 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative"
    >
      <div className="overflow-hidden rounded-2xl bg-gray-50/50 aspect-square relative">
        <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/5 transition-colors duration-500 z-10" />
        <img
          src={product.image || product.images?.[0] || "/placeholder.png"}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-gray-900 truncate">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center text-amber-400">
            <FiStar className={product.rating >= 1 ? "fill-amber-400" : "fill-gray-200 text-gray-200"} size={14} />
            <FiStar className={product.rating >= 2 ? "fill-amber-400" : "fill-gray-200 text-gray-200"} size={14} />
            <FiStar className={product.rating >= 3 ? "fill-amber-400" : "fill-gray-200 text-gray-200"} size={14} />
            <FiStar className={product.rating >= 4 ? "fill-amber-400" : "fill-gray-200 text-gray-200"} size={14} />
            <FiStar className={product.rating >= 5 ? "fill-amber-400" : "fill-gray-200 text-gray-200"} size={14} />
          </div>
          <span className="text-xs font-semibold text-gray-600">
            {product.rating?.toFixed(1) || 0} ({product.numReviews || 0})
          </span>
        </div>

      {/* Seller Name */}
        <p
          onClick={handleSellerClick}
          className={`text-sm mt-1.5 transition-colors ${
            product.seller
              ? "text-gray-500 hover:text-primary-600 cursor-pointer"
              : "text-gray-400 cursor-default"
          }`}
        >
          Sold by:{" "}
          <span className="font-medium text-gray-700">
            {product.seller?.shopName || "By Verse Official"}
          </span>
        </p>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-gray-900 font-extrabold text-xl tracking-tight">
            ₹{product.price}
          </p>
          <button className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-primary-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
             Quick View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;