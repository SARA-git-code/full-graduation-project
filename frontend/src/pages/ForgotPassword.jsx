import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1); // 1 = email, 2 = code
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      const res = await axios.post("/users/request-reset", { email });
      setMsg(res.data.message);
      setStep(2); // ✅ ننتقل إلى إدخال الكود
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      const res = await axios.post("/users/reset-password/verify-code", {
        email,
        code,
      });

      // ✅ الانتقال إلى صفحة إدخال كلمة المرور الجديدة وتمرير البيانات
      navigate("/reset-password", { state: { email, code } });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
    }
  };

  return (
    <div className="main-content">
      <div className="container mt-5">
        <h2>Reset Your Password</h2>

        {/* ✅ الخطوة 1: إدخال البريد الإلكتروني */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              className="form-control my-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              Send Reset Code
            </button>
          </form>
        )}

        {/* ✅ الخطوة 2: إدخال كود التحقق */}
        {step === 2 && (
          <form onSubmit={handleCodeSubmit}>
            <input
              type="text"
              placeholder="Enter reset code"
              className="form-control my-2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-success">
              Verify Code
            </button>
          </form>
        )}

        {msg && <div className="alert alert-success mt-3">{msg}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </div>
  );
};

export default ForgotPassword;
