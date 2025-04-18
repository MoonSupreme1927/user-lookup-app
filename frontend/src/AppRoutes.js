// AppRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import UserDetail from './UserDetail';import Login from './Login';

const AppRoutes = (props) => (
  <Routes>
    <Route path="/" element={<Home {...props} />} />
    <Route path="/users/:id" element={<UserDetail />} />
    <Route path="/login" element={<Login navigate={props.navigate} />} />
  </Routes>
);

export default AppRoutes;
// AppRoutes.js
// import React from 'react';