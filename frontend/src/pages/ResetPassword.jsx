import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, code } = location.state || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const res = await axios.post(
        "/users/reset-password",
        { email, code, password },
        { withCredentials: true }
      );

      setMsg(res.data.message);
      setTimeout(() => navigate("/auth"), 3000); // ✅ توجيه تلقائي بعد 3 ثوانٍ
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed.");
    }
  };

  if (!email || !code) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Invalid access. Please go through the reset process again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Set New Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New password"
          className="form-control my-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          className="form-control my-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-success w-100">
          Reset Password
        </button>
      </form>

      {msg && (
        <div className="alert alert-success mt-3">
          {msg} Redirecting to login...
        </div>
      )}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
};

export default ResetPassword;
