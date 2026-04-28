import { Link } from "react-router-dom";
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-indigo-600">
              By Verse
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed font-medium max-w-xs">
              Elevating your lifestyle with premium curated products. Experience uncompromising quality and modern design.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors shadow-sm border border-gray-100">
                <FiFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm border border-gray-100">
                <FiTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-colors shadow-sm border border-gray-100">
                <FiInstagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-extrabold text-gray-900 mb-6 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-gray-500 font-medium text-sm hover:text-primary-600 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary-400 opacity-0 transition-opacity" /> Shop All</Link></li>
              <li><Link to="/wishlist" className="text-gray-500 font-medium text-sm hover:text-primary-600 transition-colors">My Wishlist</Link></li>
              <li><Link to="/cart" className="text-gray-500 font-medium text-sm hover:text-primary-600 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/profile/orders" className="text-gray-500 font-medium text-sm hover:text-primary-600 transition-colors">Track Returns</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-extrabold text-gray-900 mb-6 uppercase tracking-wider text-sm">Customer Help</h3>
            <ul className="space-y-3">
              <li><Link to="/profile/help" className="text-gray-500 font-medium text-sm hover:text-primary-600 transition-colors">Help Center & FAQ</Link></li>
              <li><Link to="/profile/terms" className="text-gray-500 font-medium text-sm hover:text-primary-600 transition-colors">Shipping Information</Link></li>
              <li><Link to="/profile/terms" className="text-gray-500 font-medium text-sm hover:text-primary-600 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/profile/terms" className="text-gray-500 font-medium text-sm hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-extrabold text-gray-900 mb-6 uppercase tracking-wider text-sm">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm font-medium text-gray-500">
                <FiMapPin className="text-primary-500 shrink-0 mt-0.5" size={18} />
                <span>123 Innovation Drive,<br/>Tech District, TX 75001</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-gray-500">
                <FiPhone className="text-primary-500 shrink-0" size={18} />
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-gray-500">
                <FiMail className="text-primary-500 shrink-0" size={18} />
                <span>support@byverse.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm font-semibold">
            &copy; {currentYear} By Verse. All rights reserved.
          </p>
          <div className="flex gap-4 text-gray-400 text-sm font-bold">
            <span className="cursor-pointer hover:text-gray-600">Terms</span>
            <span className="cursor-pointer hover:text-gray-600">Privacy</span>
            <span className="cursor-pointer hover:text-gray-600">Security</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
