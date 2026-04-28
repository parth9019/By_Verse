import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SellerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500 text-lg">
          Loading seller panel...
        </span>
      </div>
    );
  }

  if (!user || user.role !== "seller") {
    return <Navigate to="/" />;
  }

  return children;
};

export default SellerRoute;
