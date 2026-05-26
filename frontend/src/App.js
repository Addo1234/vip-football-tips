import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";

import HomePage from "./pages/HomePage";
import VipPage from "./pages/VipPage";
import PremiumPage from "./pages/PremiumPage";
import FixedOddsPage from "./pages/FixedOddsPage";
import ResultsPage from "./pages/ResultsPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PaymentCallbackPage from "./pages/PaymentCallbackPage";
import AdminDashboard from "./pages/AdminDashboard";
import AccountPage from "./pages/AccountPage";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideChrome = ["/login", "/signup"].includes(location.pathname);
  return (
    <>
      {!hideChrome && <Navbar />}
      <main className="min-h-screen">{children}</main>
      {!hideChrome && <Footer />}
      {!hideChrome && <WhatsAppFloat />}
    </>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "#1A243D",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
              },
            }}
          />
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/vip" element={<VipPage />} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/fixed-odds" element={<FixedOddsPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/payment/callback" element={<PaymentCallbackPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/account" element={<AccountPage />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
