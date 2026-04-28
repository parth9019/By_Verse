import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user?.name} 👋
      </h1>

      <p className="text-gray-600 mb-6">
        This is your user dashboard
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4">My Orders</div>
        <div className="border rounded-lg p-4">My Profile</div>
        <div className="border rounded-lg p-4">Wishlist</div>
      </div>
    </div>
  );
};

export default Dashboard;
