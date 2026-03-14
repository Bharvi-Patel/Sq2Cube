import { createContext, useContext, useState, useEffect } from "react";
import { setToken, clearToken, api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    if (!savedToken) {
      setLoading(false);
      return;
    }
    setToken(savedToken);
    api("/profile/me")
      .then((userData) => setUser(userData))
      .catch(() => {
        sessionStorage.removeItem("token");
        clearToken();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (token) => {
    sessionStorage.setItem("token", token);
    setToken(token);
    const userData = await api("/profile/me");
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    clearToken();
    setUser(null);
  };

  const refreshUser = async () => {
    const userData = await api("/profile/me");
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);