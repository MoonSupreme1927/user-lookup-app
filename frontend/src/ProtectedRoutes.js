// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  return token ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
// This component checks if a user is authenticated by looking for a token in localStorage.
// If the token exists, it renders the children components; otherwise, it redirects to the home page.