import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import api from "../api/axios";

const SellerStore = () => {
  const { id } = useParams();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerStore = async () => {
    try {
      const res = await api.get(`/sellers/${id}`);
      setSeller(res.data.seller);
      setProducts(res.data.products);
    } catch (error) {
      console.error("Failed to load seller store");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerStore();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-gray-500">
          Loading seller store...
        </div>
      </>
    );
  }

  if (!seller) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-gray-500">
          Seller not found
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Seller Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold">
            🏪 {seller.shopName}
          </h1>

          <p className="text-gray-500 mt-2">
            Products by this seller
          </p>
        </div>

        {/* Products */}
        {products.length === 0 ? (
          <div className="text-gray-500">
            No products from this seller
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SellerStore;