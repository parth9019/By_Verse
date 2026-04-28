import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore user
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");

    if (token && storedUser) {
      setUser({ ...JSON.parse(storedUser), token });
    }

    setLoading(false);
  }, []);

  // 🔐 LOGIN
  const login = async (email, password) => {
    // ❗ CLEAR OLD SESSION
    sessionStorage.clear();

    const res = await api.post("/auth/login", { email, password });

    const userData = {
      ...res.data.user,
      token: res.data.token,
    };

    sessionStorage.setItem("token", res.data.token);
    sessionStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(userData);

    return userData;
  };

  // 🚪 LOGOUT
  const logout = async () => {
    try {
      if (user?.token) {
        await api.post("/auth/logout");
      }
    } catch (e) {
      console.error("Audit ping failed on logout", e);
    } finally {
      sessionStorage.clear();
      setUser(null);
      window.location.href = "/login"; // HARD RESET
    }
  };

  // 🔄 UPDATE LOCAL USER STATE AESTHETICALLY
  const updateLocalUser = (updatedFields) => {
    if (!user) return;
    const patchedUser = { ...user, ...updatedFields };
    setUser(patchedUser);
    sessionStorage.setItem("user", JSON.stringify(patchedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
