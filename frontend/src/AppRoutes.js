// AppRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import UserDetail from './UserDetail';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import LandingPage from './LandingPage';

const AppRoutes = (props) => (
  <Routes>
    <Route path="/LandingPage" element={<LandingPage {...props} />} />
    <Route path="/login" element={<Login {...props} />} />
    <Route path="/signup" element={<Signup {...props} />} />
    <Route path="/dashboard" element={<Dashboard {...props} />} />
    <Route path="/users/:id" element={<UserDetail />} />
    <Route path="/forgot-password" element={<ForgotPassword {...props} />} />
    <Route path="/reset-password/:token" element={<ResetPassword {...props} />} />
    <Route path="/home" element={<Home {...props} />} />
  </Routes>
);

export default AppRoutes;
