import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import { FiLock, FiCheckCircle } from "react-icons/fi";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// ⭐ Initialize Stripe - safely fallback if env not found yet
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder");

/* =========================================
 * STRIPE NATIVE PAYMENT FORM
 * ========================================= */
const StripePaymentForm = ({ totalAmount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 space-y-6">
      <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl flex items-center justify-between font-bold border border-indigo-100 mb-6">
        <span>Total Payable</span>
        <span className="text-xl">₹{totalAmount}</span>
      </div>

      <PaymentElement />

      {errorMessage && <div className="text-red-500 text-sm font-bold mt-2">{errorMessage}</div>}

      <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-2 py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:bg-gray-400 flex justify-center items-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <FiLock /> Pay ₹{totalAmount}
            </>
          )}
        </button>
      </div>

      <p className="text-center text-xs font-bold text-gray-400 flex items-center justify-center gap-1 mt-4">
        <FiCheckCircle className="text-emerald-500" /> Payments secured by Stripe
      </p>
    </form>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  const [address, setAddress] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("ONLINE"); // ⭐ Default to ONLINE per user request

  // Gateway Simulation State
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [isInitializingStripe, setIsInitializingStripe] = useState(false);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(true);

  // ⭐ NEW COUPON STATE
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      try {
        const res = await api.get("/user/addresses");
        const addresses = res.data;
        const defaultAddr = addresses.find((a) => a.isDefault);
        
        if (defaultAddr) {
          setAddress({
            address: defaultAddr.address || "",
            city: defaultAddr.city || "",
            state: defaultAddr.state || "",
            country: defaultAddr.country || "",
            pincode: defaultAddr.pincode || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch default address");
      } finally {
        setLoadingAddress(false);
      }
    };

    const fetchCoupons = async () => {
      try {
        const res = await api.get("/coupons/available");
        setAvailableCoupons(res.data);
      } catch (err) {
        console.warn("Failed to load available coupons", err);
      }
    };

    fetchDefaultAddress();
    fetchCoupons();
  }, []);

  const baseTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const discountedTotal = baseTotal - discountAmount;
  const shippingCharge = baseTotal > 1000 ? 149 : 0;
  const gstAmount = Math.round(discountedTotal * 0.18);
  const finalTotal = discountedTotal + shippingCharge + gstAmount;

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    try {
      setApplyingCoupon(true);
      const res = await api.post("/coupons/validate", {
        code: couponCodeInput,
        totalAmount: baseTotal,
      });
      setDiscountAmount(res.data.discountAmount);
      setAppliedCoupon(res.data.code);
      setCouponCodeInput("");
    } catch (error) {
      alert(error.response?.data?.message || "Invalid coupon.");
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const handleOrderInit = async () => {
    if (!address.address || !address.city || !address.state || !address.country || !address.pincode) {
      alert("Please fill all shipping address fields");
      return;
    }
    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (paymentMethod === "ONLINE") {
      try {
        setIsInitializingStripe(true);
        const res = await api.post("/orders/create-payment-intent", { totalAmount: finalTotal });
        setClientSecret(res.data.clientSecret);
        setShowPaymentGateway(true);
      } catch (error) {
        alert(error.response?.data?.message || "Failed to initialize secure payment portal. Check Stripe Keys.");
      } finally {
        setIsInitializingStripe(false);
      }
    } else {
      executeOrder(null);
    }
  };

  const executeOrder = async (transactionId = null) => {
    if (placingOrder) return;
    try {
      setPlacingOrder(true);

      const payload = {
        items: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
        })),
        totalAmount: finalTotal,
        discountAmount,
        couponApplied: appliedCoupon,
        shippingAddress: {
          address: address.address,
          city: address.city,
          state: address.state,
          country: address.country,
          pincode: address.pincode,
        },
        paymentMethod,
        transactionId,
      };

      await api.post("/orders", payload);

      clearCart();

      if (paymentMethod === "ONLINE") {
        alert("Payment Successful 🎉");
      } else {
        alert("Order placed successfully 🎉");
      }

      navigate("/my-orders");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place order");
      setPlacingOrder(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-8">Secure Checkout</h1>

        {/* CART ITEMS */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 rounded-xl w-16 h-16 shrink-0 p-1 border border-gray-100">
                  <img
                    src={
                      item.image && item.image.startsWith("http")
                        ? item.image
                        : "/placeholder.png"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover mix-blend-multiply rounded-lg"
                  />
                </div>

                <div>
                  <p className="font-bold text-gray-900 line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-sm font-medium text-gray-500">
                    ₹{item.price} × {item.qty}
                  </p>
                </div>
              </div>

              <p className="font-extrabold text-gray-900">
                ₹{item.price * item.qty}
              </p>
            </div>
          ))}

          {/* COUPON SECTION */}
          {!appliedCoupon ? (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="PROMO CODE"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCodeInput.trim()}
                  className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 transition-colors hover:bg-black"
                >
                  {applyingCoupon ? "..." : "Apply"}
                </button>
              </div>

              {/* AVAILABLE COUPONS */}
              {availableCoupons.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <FiCheckCircle /> Available Offers For You
                  </p>
                  {availableCoupons.map((coupon) => (
                    <div key={coupon._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl border-dashed">
                       <div className="w-full">
                         <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-black px-2 py-1 rounded uppercase tracking-wider">{coupon.code}</span>
                         <span className="text-sm font-semibold text-gray-700 ml-2">
                           Save {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                         </span>
                         {coupon.minOrderValue > 0 && (
                           <p className="text-xs text-gray-500 font-medium mt-1">on orders above ₹{coupon.minOrderValue}</p>
                         )}
                       </div>
                       <button
                         onClick={() => setCouponCodeInput(coupon.code)}
                         className="w-full sm:w-auto text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white shadow-sm border border-indigo-100 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                       >
                         Use Code
                       </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50 border border-emerald-100 p-4 rounded-xl mt-6 pt-4">
              <div className="w-full">
                <span className="flex items-center gap-1 text-emerald-700 font-black uppercase tracking-widest text-sm">
                   <FiCheckCircle className="w-4 h-4" /> {appliedCoupon} APPLIED
                </span>
                <p className="text-emerald-600 text-xs font-bold mt-1">You saved ₹{discountAmount}</p>
              </div>
              <button 
                onClick={handleRemoveCoupon} 
                className="w-full sm:w-auto text-red-500 hover:text-red-700 text-sm font-bold uppercase tracking-wider bg-white px-3 py-2 rounded-lg shadow-sm text-center"
              >
                Remove
              </button>
            </div>
          )}

          {/* TOTALS OVERVIEW */}
          <div className="flex flex-col gap-2 mt-6 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center text-lg text-gray-500 font-semibold">
              <span>Subtotal:</span>
              <span>₹{baseTotal}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between items-center text-lg text-emerald-600 font-bold">
                <span>Discount:</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-lg text-gray-500 font-semibold mb-2 pb-3 border-b border-gray-100">
              <span className="flex items-center gap-2">Estimated GST <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider font-extrabold">18%</span></span>
              <span>+₹{gstAmount}</span>
            </div>

            <div className="flex justify-between items-center text-lg text-gray-500 font-semibold mb-2 pb-3 border-b border-gray-100">
              <span>Shipping Fee</span>
              {shippingCharge === 0 ? (
                 <span className="text-emerald-600 font-bold uppercase tracking-widest text-sm">Free Delivery</span>
              ) : (
                 <span>+₹{shippingCharge}</span>
              )}
            </div>

            <div className="flex justify-between items-center text-2xl font-black text-gray-900 mt-2">
              <span>Grand Total:</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>
        </div>

        {/* ADDRESS */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Shipping Address
          </h2>

          <div className="space-y-4">
            {loadingAddress ? (
               <div className="animate-pulse flex space-x-4"><div className="h-10 bg-gray-200 rounded-xl w-full"></div></div>
            ) : (
              <>
                <input
                  placeholder="Full Address"
              className="w-full border border-gray-200 bg-gray-50/50 px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-inner"
              value={address.address}
              onChange={(e) =>
                setAddress({ ...address, address: e.target.value })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                placeholder="City"
                className="w-full border border-gray-200 bg-gray-50/50 px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-inner"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
              />

              <input
                placeholder="State / Province"
                className="w-full border border-gray-200 bg-gray-50/50 px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-inner"
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
              />

              <input
                placeholder="Country"
                className="w-full border border-gray-200 bg-gray-50/50 px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-inner"
                value={address.country}
                onChange={(e) =>
                  setAddress({ ...address, country: e.target.value })
                }
              />

              <input
                placeholder="Pincode"
                className="w-full border border-gray-200 bg-gray-50/50 px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-inner"
                value={address.pincode}
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value })
                }
              />
            </div>
            </>
           )}
          </div>
        </div>

        {/* PAYMENT METHOD ⭐ */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Payment Method
          </h2>

          <div className="space-y-3">
            {/* COD Temp Commented 
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
            */}

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
            onClick={handleOrderInit}
            disabled={placingOrder || isInitializingStripe}
            className="w-full mt-8 py-5 bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-75 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {placingOrder || isInitializingStripe ? "Processing..." : paymentMethod === "ONLINE" ? `Pay ₹${finalTotal} Securely` : "Place Order"}
            {paymentMethod === "ONLINE" && !placingOrder && !isInitializingStripe && <FiLock />}
          </button>
        </div>
      </div>

      {/* SECURE STRIPE PAYMENT GATEWAY */}
      <Modal isOpen={showPaymentGateway} onClose={() => setShowPaymentGateway(false)} title="Secure Checkout">
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm 
              totalAmount={finalTotal} 
              onSuccess={(txnId) => executeOrder(txnId)} 
              onCancel={() => setShowPaymentGateway(false)}
            />
          </Elements>
        )}
      </Modal>
    </>
  );
};

export default Checkout;