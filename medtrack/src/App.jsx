import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginScreen from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import React, { Suspense } from "react";
import MedicineShow from './pages/MedicineShow';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/medicine/:id" element={<MedicineShow />}/>
      </Routes>
    </Router>
  );
}

export default App;