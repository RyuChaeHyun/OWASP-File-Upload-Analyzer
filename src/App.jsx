import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "layouts/main";
const App = () => {
  return (
    <Routes>
      <Route path="main/*" element={<AdminLayout />} />
      <Route path="/" element={<Navigate to="/main" replace />} />
    </Routes>
  );
};

export default App;
