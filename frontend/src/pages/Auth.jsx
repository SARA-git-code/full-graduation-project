import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import don from "../assets/don.jpg";
import axios from "axios";
import { useUserContext } from "../context/UserContext";

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPhone, setShowPhone] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const { fetchUser } = useUserContext();
  const navigate = useNavigate();
  const routeLocation = useLocation();

  useEffect(() => {
    if (routeLocation.state?.signup) {
      setIsSignIn(false);
      setTimeout(() => {
        document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
    }
  }, [routeLocation.state]);

  const jordanGovernorates = [
    "Amman", "Irbid", "Zarqa", "Balqa", "Madaba", "Aqaba", "Karak",
    "Tafilah", "Ma'an", "Jerash", "Ajloun", "Mafraq",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignIn && password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      if (!isSignIn) {
        await axios.post("/auth/register", {
          name,
          email,
          password,
          confirmPassword,
          phone,
          location,
          showPhone,
        });
        alert("A verification code has been sent to your email.");
        setShowVerification(true);
      } else {
        await axios.post("/auth/login", { email, password });
        await fetchUser();
        navigate("/profile");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleVerifyCode = async () => {
    try {
      await axios.post("/auth/verify", {
        email,
        code: verificationCode,
      });
      await fetchUser();
      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="main-content">
      <div className="container mt-5">
        <div className="row justify-content-center align-items-center shadow-lg rounded overflow-hidden" style={{ minHeight: "500px" }}>
          <div className="col-lg-6 d-none d-lg-block p-0">
            <img src={don} alt="Donate" className="img-fluid h-100 w-100" style={{ objectFit: "cover" }} />
          </div>

          <div className="col-lg-6 bg-white p-5">
            <h2 className="text-center mb-4">{isSignIn ? "Sign In" : "Sign Up"}</h2>
            <form onSubmit={handleSubmit}>
              {!isSignIn && (
                <>
                  <input type="text" className="form-control mb-2" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <input type="tel" className="form-control mb-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  <select className="form-control mb-2" value={location} onChange={(e) => setLocation(e.target.value)} required>
                    <option value="">Select Governorate</option>
                    {jordanGovernorates.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                  <div className="form-check mb-2">
                    <input type="checkbox" className="form-check-input" id="showPhone" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} />
                    <label className="form-check-label" htmlFor="showPhone">Allow others to see my phone number</label>
                  </div>
                </>
              )}
              <input type="email" className="form-control mb-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" className="form-control mb-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {!isSignIn && (
                <input type="password" className="form-control mb-2" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              )}
              <div className="form-check mb-3">
                <input type="checkbox" className="form-check-input" id="rememberMe" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
              </div>
              {isSignIn && (
                <div className="mb-2 text-end">
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
              <button className="btn btn-primary w-100" type="submit">{isSignIn ? "Sign In" : "Sign Up"}</button>
            </form>

            {showVerification && (
              <div className="alert alert-info mt-3">
                <label className="form-label">Enter the 4-digit code sent to your email:</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="e.g. 1234"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={4}
                  required
                />
                <button
                  type="button"
                  className="btn btn-success w-100"
                  onClick={handleVerifyCode}
                >
                  Verify Email
                </button>
              </div>
            )}

            <p className="text-center mt-3">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
              <button className="btn btn-link" onClick={() => setIsSignIn(!isSignIn)}>
                {isSignIn ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
