import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component, requiredRole, ...rest }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const role = localStorage.getItem('role');
  // Check if user is logged in and has the correct role
  const isAuthenticated = token && user;
  const hasPermission = isAuthenticated && role === requiredRole;

  return isAuthenticated && hasPermission ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
