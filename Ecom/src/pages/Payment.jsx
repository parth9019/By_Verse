import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [processing, setProcessing] = useState(false);

  /* ================= FETCH ORDER ================= */

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (error) {
        console.error("Failed to load order");
        alert("Order not found");
        navigate("/");
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  /* ================= HANDLE PAYMENT ================= */

  const handlePayment = async () => {
    if (processing) return;

    try {
      setProcessing(true);

      /* ===== COD ===== */

      if (paymentMethod === "COD") {
        await api.put(`/orders/${orderId}/pay`, {
          paymentMethod: "COD",
        });

        alert("Order confirmed with Cash on Delivery");

        navigate("/my-orders");
        return;
      }

      /* ===== ONLINE PAYMENT (DUMMY) ===== */

      alert("Redirecting to payment gateway...");

      setTimeout(async () => {
        await api.put(`/orders/${orderId}/pay`, {
          paymentMethod: "ONLINE",
        });

        alert("Payment Successful 🎉");

        navigate("/my-orders");
      }, 2000);

    } catch (error) {
      console.error("Payment failed", error);
      alert("Payment failed");
      setProcessing(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading payment details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-8">
          Complete Your Payment
        </h1>

        <div className="grid md:grid-cols-2 gap-6">

          {/* ORDER SUMMARY */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 rounded-xl w-14 h-14 shrink-0 p-1 border border-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover mix-blend-multiply rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-sm font-medium text-gray-500">
                      Qty: {item.qty}
                    </p>
                  </div>
                </div>
                <p className="font-extrabold text-gray-900 shrink-0">
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}

            <div className="flex justify-between items-center text-xl font-extrabold text-gray-900 mt-6 pt-4 border-t border-gray-100">
              <span>Total</span>
              <span className="text-primary-600">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Payment Method
              </h2>

              <div className="space-y-3 mb-8">
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-primary-600' : 'border-gray-400'}`}>
                    {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full" />}
                  </div>
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="hidden"
                  />
                  <span className="font-semibold text-gray-900">Cash on Delivery</span>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'border-primary-600' : 'border-gray-400'}`}>
                    {paymentMethod === 'ONLINE' && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full" />}
                  </div>
                  <input
                    type="radio"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="hidden"
                  />
                  <span className="font-semibold text-gray-900">Pay Online <span className="text-gray-500 text-sm font-normal">(Dummy)</span></span>
                </label>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all duration-300 ${
                processing
                  ? "bg-gray-400 text-white cursor-not-allowed shadow-none"
                  : "bg-linear-to-r from-primary-600 to-indigo-600 text-white hover:from-primary-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {processing
                ? "Processing Securely..."
                : "Confirm Payment"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Payment;