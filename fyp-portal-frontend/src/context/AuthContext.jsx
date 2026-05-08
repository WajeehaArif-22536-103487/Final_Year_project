import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error("Error parsing stored session", e);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    const { token: userToken, user: userData } = data;
    if (!userToken || !userData) {
      console.error("Login failed: Missing token or user data", data);
      return;
    }
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser  }}>
      {children}
    </AuthContext.Provider>
  );
};
