import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { decodeJson } from "../pages/jobtracking";

interface PrivateRouteProps {
  element: JSX.Element;
  role?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, role }) => {
  const { isAuthenticated } = useAuth();
  const userRole = decodeJson("user")?.role;
  const location = useLocation();
  console.log(isAuthenticated, role, userRole, location);
  // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
  if (!userRole) {
    return <Navigate to='/login' state={{ from: location }} />;
  }

  // Rol doğrulaması yapılacaksa ve rol uyumsuzsa giriş sayfasına yönlendir
  if (!role) {
    return <Navigate to='/login' state={{ from: location }} />;
  }
  if (userRole === "Employee" && location.pathname.includes("/admin")) {
    return <Navigate to='/employee' state={{ from: location }} />;
  }
  return element;
};

export default PrivateRoute;
