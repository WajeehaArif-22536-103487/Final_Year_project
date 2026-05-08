import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "./Loader";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  // 1. Wait for AuthContext to finish loading from LocalStorage
  if (loading) {
    return <Loader/>;
  }

  // 2. If no user is found, send them to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Simple role check
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;