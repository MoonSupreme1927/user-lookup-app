// ProtectedRoutes.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoutes = ({ children }) => {
  const token = localStorage.getItem('token');
  const loggedInUser = localStorage.getItem('loggedInUser');

  if (!token || !loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;
