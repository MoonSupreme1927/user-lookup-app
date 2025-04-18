// AppRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import UserDetail from './UserDetail';

const AppRoutes = (props) => (
  <Routes>
    <Route path="/" element={<Home {...props} />} />
    <Route path="/users/:id" element={<UserDetail />} />
  </Routes>
);

export default AppRoutes;
// AppRoutes.js
// import React from 'react';