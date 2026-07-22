import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (!token) {
    sessionStorage.setItem('redirect_after_login', location.pathname);
    return <Navigate to="/connexion" replace />;
  }
  return children;
};
export default ProtectedRoute;