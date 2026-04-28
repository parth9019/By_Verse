import { FiFileText } from "react-icons/fi";

const Terms = () => {
  return (
    <div className="max-w-4xl">
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Terms & Policies
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Please read these terms carefully before using our services.
        </p>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 space-y-10">
        <Section
          title="1. General Terms"
          text="By accessing and using this platform, you agree to comply with all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the service."
        />

        <Section
          title="2. Account Responsibility"
          text="You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
        />

        <Section
          title="3. Orders & Payments"
          text="All orders placed through the platform are subject to availability and confirmation. Prices, offers, and availability may change without prior notice."
        />

        <Section
          title="4. Cancellation & Refunds"
          text="Orders can be cancelled before shipment. Refunds (if applicable) will be processed according to our refund policy. Please ensure you check the return eligibility clearly on the product page."
        />

        <Section
          title="5. Privacy Policy"
          text="Your personal data is handled securely and used only in accordance with our privacy policy. We will not sell your data to any third party entities."
        />

        <div className="text-sm font-semibold text-gray-500 pt-6 border-t border-gray-100 bg-gray-50/50 p-4 rounded-xl text-center">
          Last updated: January 2026
        </div>
      </div>
    </div>
  );
};

export default Terms;

/* ===== SUB COMPONENT ===== */
const Section = ({ title, text }) => (
  <div className="group">
    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
         <FiFileText size={16} />
      </div>
      {title}
    </h3>
    <p className="text-base text-gray-600 mt-4 leading-relaxed font-medium pl-11">
      {text}
    </p>
  </div>
);
