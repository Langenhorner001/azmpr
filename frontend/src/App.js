import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import Analytics from "./components/Analytics";
import SEOHead from "./components/SEOHead";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

const AdminRoute = () => {
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem("az-admin-token"));
  return isAuth
    ? <AdminDashboard onLogout={() => setIsAuth(false)} />
    : <AdminLogin onLogin={() => setIsAuth(true)} />;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <Analytics />
          <SEOHead />
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{ className: "font-display" }}
          />
          <div className="App">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin" element={<AdminRoute />} />
              </Routes>
            </BrowserRouter>
          </div>
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
