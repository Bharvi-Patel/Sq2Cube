import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  // Wait for the token verification before deciding to redirect
  if (loading) return null;

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;