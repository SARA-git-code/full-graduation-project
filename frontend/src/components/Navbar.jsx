import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  Gift,
  UserCircle,
  MessageCircle,
  LogIn,
  PlusCircle,
  Home,
} from "lucide-react";
import { Dropdown } from "react-bootstrap";
import { Settings } from "lucide-react";
import translations from "../translations";
import axios from "axios";
import { useUserContext } from "../context/UserContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser } = useUserContext();
  const lang = localStorage.getItem("language") || "en";
  const t = translations[lang];
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  useEffect(() => {
    axios
      .get("/users/profile", { withCredentials: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > lastScrollTop && currentScroll > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollTop(currentScroll);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop]);

  return (
   <nav
  className={`navbar navbar-expand-lg navbar-light transition-all ${showNavbar ? "visible" : "invisible"} ${isHome ? "" : "shadow-sm bg-white"}`}
  style={{
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    transition: "top 0.3s ease-in-out",
    position: "fixed",
    top: showNavbar ? "0" : "-100px",
    width: "100%",
    zIndex: 1000,
    backgroundColor: isHome ? "transparent" : "#fff",
    backdropFilter: isHome ? "blur(8px)" : "none",
  }}
>

      <div className="container-fluid">
        <Link
          to="/"
          className={`navbar-brand d-flex align-items-center px-3 text-dark`}
        >
          <Heart className="me-2 text-primary" />
          <span className="fw-bold text-dark fs-4">Give & Gather</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto d-flex align-items-center gap-3">
            {user?.role === "admin" && (
              <li className="nav-item">
                <Link to="/admin" className="nav-link text-dark">
                  <Settings size={18} className="me-1" /> Admin Panel
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link to="/" className="nav-link text-dark">
                <Home size={18} className="me-1" /> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to={user ? "/add-donation" : "/auth"} className="nav-link text-dark">
                <PlusCircle size={18} className="me-1" /> Add
              </Link>
            </li>
            <li className="nav-item">
              <Link to={user ? "/donations" : "/auth"} className="nav-link text-dark">
                <Gift size={18} className="me-1" /> {t.donations}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/chat" className="nav-link text-dark">
                <MessageCircle size={18} className="me-1" /> {t.messages}
              </Link>
            </li>
            {user ? (
              <li className="nav-item">
                <Dropdown align="end">
                  <Dropdown.Toggle
                    as="div"
                    className="d-flex align-items-center border-0 bg-transparent"
                    style={{ cursor: "pointer" }}
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage.startsWith("http") ? user.profileImage : `http://localhost:5050/uploads/${user.profileImage}`}
                        alt="Profile"
                        className="rounded-circle"
                        width="40"
                        height="40"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <UserCircle size={32} className="text-secondary" />
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-end shadow-sm border-0 mt-2">
                    <Dropdown.Item as={Link} to="/profile" className="text-primary">
                      <UserCircle size={16} className="me-2" /> {t.profile}
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/settings" className="text-primary">
                      <Settings size={16} className="me-2" /> {t.settings}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      as="button"
                      onClick={async () => {
                        try {
                          await axios.post("/auth/logout", {}, { withCredentials: true });
                          setUser(null);
                          navigate("/auth");
                        } catch (err) {
                          alert("Logout failed");
                        }
                      }}
                      className="text-danger"
                    >
                      <LogIn size={16} className="me-2" /> {t.signOut}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            ) : (
              <li className="nav-item">
                <Link to="/auth" className="btn btn-primary d-flex align-items-center">
                  <LogIn size={18} className="me-1" /> <span>Sign In</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
