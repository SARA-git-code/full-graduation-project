// src/components/EmailVerification.jsx
import React, { useState } from "react";
import axios from "axios";

const EmailVerification = ({ email, onVerified }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      const res = await axios.post("/users/verify", { email, code });
      onVerified(res.data); // نُمرر بيانات التوكن واليوزر للأب
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2>Verify your email</h2>
        <p>Enter the 4-digit code sent to <strong>{email}</strong></p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={4}
          placeholder="Enter code"
        />
        <button onClick={handleVerify}>Verify</button>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
};

export default EmailVerification;
