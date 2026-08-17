import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ApplyLoan from "./pages/ApplyLoan";
import Admin from "./pages/Admin";
import Payment from "./pages/Payment";
import KYC from "./pages/KYC";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Apply Loan */}
        <Route path="/apply-loan" element={<ApplyLoan />} />

        <Route path="/admin" element={<Admin />} />

        <Route path="/payment" element={<Payment />} />
        <Route path="/kyc" element={<KYC />} />
        {/* Unknown URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
