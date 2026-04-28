import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, updateQty, removeFromCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-5xl mx-auto p-10 flex flex-col items-center justify-center text-center">
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
            <Link to="/" className="inline-block bg-gray-900 text-white font-medium px-8 py-3 rounded-xl hover:bg-primary-600 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CART ITEMS */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-6">Shopping Cart</h1>
          
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row gap-6 p-6 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-gray-50 rounded-2xl w-full sm:w-32 h-32 shrink-0 p-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover mix-blend-multiply rounded-xl"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                  <p className="text-gray-900 font-extrabold text-xl mt-1 tracking-tight">
                    ₹{item.price}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    <button
                      onClick={() => updateQty(item._id, item.qty - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      −
                    </button>
                    <span className="font-bold text-gray-900 w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item._id, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-sm font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="lg:mt-14 h-fit">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

            <div className="space-y-4 text-gray-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-900 font-semibold">₹{subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-md text-sm">FREE</span>
              </div>
            </div>

            <hr className="my-6 border-gray-100" />

            <div className="flex justify-between text-xl font-extrabold text-gray-900 mb-8">
              <span>Total</span>
              <span>₹{subtotal}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-4 text-lg font-bold text-white shadow-lg bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              Checkout Securely
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
