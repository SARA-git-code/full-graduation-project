import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  BrowserRouter,
} from "react-router-dom";
import ResetPassword from './ResetPassword'; 
import Auth from "./Auth";
import Donations from "./Donations";
import AddDonation from "./AddDonations";
import Chat from "./Chat";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Home from "./Home";
import SettingsPage from "./SettingsPage";
import Profile from "./Profile";
import ForgotPassword from "./ForgotPassword";
import VerifyResetCode from "./VerifyResetCode";
import DonationDetails from "./DonationDetails";
import EditDonation from "./EditDonation";
import { useUserContext } from "../context/UserContext";
import AdminDashboard from "../pages/AdminDashboard";
import AdminHome from "../components/admin/AdminHome";
import DonationsAdmin from "../components/admin/DonationsAdmin";
import UsersAdmin from "../components/admin/UsersAdmin";
import ReportsAdmin from "../components/admin/ReportsAdmin";
import JoinUsSection from "../components/JoinUsSection";
import ScrollToTop from "../components/ScrollToTop";
import AOS from "aos";
import "aos/dist/aos.css";



function AppContent() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "en");
  const location = useLocation();
  const { user, loading } = useUserContext();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-in-out" });
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const AdminRoute = ({ children }) => {
    if (loading) return <div style={{ minHeight: "400px", textAlign: "center" }}>Loading admin access...</div>;
    if (!user) return <Navigate to="/auth" />;
    if (user.role !== "admin") return <Navigate to="/" />;
    return children;
  };

  return (
    <>
      <Navbar language={language} setLanguage={setLanguage} />

      <main className="main-content">
        {loading ? (
          <div style={{ minHeight: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </span>
          </div>
        ) : (
          <>
        <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/auth" element={<Auth />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/verify-reset" element={<VerifyResetCode />} />
  <Route path="/reset-password" element={<ResetPassword />} />

  <Route path="/donations" element={<Donations />} />
  <Route path="/donations/:id" element={<DonationDetails />} />
  <Route path="/donations/edit/:id" element={<EditDonation />} />
  <Route path="/add-donation" element={<AddDonation />} />

  <Route path="/profile" element={<Profile />} />
  <Route path="/profile/:id" element={<Profile />} />

  <Route path="/chat" element={<Chat />} />
  <Route path="/chat/:id" element={<Chat />} />

  <Route path="/settings" element={<SettingsPage setTheme={setTheme} setLanguage={setLanguage} />} />

  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
    <Route index element={<AdminHome />} />
    <Route path="users" element={<UsersAdmin />} />
    <Route path="reports" element={<ReportsAdmin />} />
    <Route path="donations" element={<DonationsAdmin />} />
  </Route>
</Routes>


            {/* ✅ Show JoinUsSection only on home page */}
            {location.pathname === "/" && <JoinUsSection />}
          </>
        )}
      </main>

      {!loading && <Footer />}
    </>
  );
}

// ✅ App wrapper with BrowserRouter + ScrollToTop inside
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
