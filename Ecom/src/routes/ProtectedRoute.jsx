import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  // 🚫 Admin should not use user routes
  if (user.role === "admin") {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default ProtectedRoute;
