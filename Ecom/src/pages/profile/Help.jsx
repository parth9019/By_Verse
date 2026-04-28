import {
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiMessageCircle,
} from "react-icons/fi";

const Help = () => {
  return (
    <div className="max-w-4xl">
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Help & Support
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          We’re here to help you with any questions or issues.
        </p>
      </div>

      {/* SUPPORT OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <SupportCard
          icon={<FiMail />}
          title="Email Support"
          text="Reach us via email and we’ll respond within 24 hours."
          action="support@byverse.com"
        />

        <SupportCard
          icon={<FiPhone />}
          title="Call Support"
          text="Speak directly with our support team."
          action="+91 99999 88888"
        />

        <SupportCard
          icon={<FiMessageCircle />}
          title="Live Chat"
          text="Chat with our support agents for quick help."
          action="Start Chat"
        />

        <SupportCard
          icon={<FiHelpCircle />}
          title="FAQs"
          text="Find quick answers to common questions."
          action="View FAQs"
        />
      </div>

      {/* FOOTER NOTE */}
      <div className="mt-10 px-6 py-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center gap-3 text-gray-500 font-medium w-fit">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Support Hours: Monday – Saturday, 9:00 AM to 7:00 PM (IST)
      </div>
    </div>
  );
};

export default Help;

/* ===== CARD COMPONENT ===== */
const SupportCard = ({ icon, title, text, action }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group flex flex-col h-full">
    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
      <span className="text-2xl">{icon}</span>
    </div>
    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    <p className="text-gray-500 font-medium mt-2 grow leading-relaxed">{text}</p>
    <button className="mt-6 text-sm font-bold text-primary-600 hover:text-primary-700 transition w-fit group-hover:underline underline-offset-4">
      {action}
    </button>
  </div>
);
