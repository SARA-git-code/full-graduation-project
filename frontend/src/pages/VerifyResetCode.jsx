import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyResetCode = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // تحقق من الكود في الباك إند (اختياري هنا)
      const res = await axios.post("/users/verify-reset-code", { email, code });

      // 👇 ننتقل إلى صفحة تغيير الباسورد مع تمرير الإيميل
     navigate("/reset-password", { state: { email, code } });

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Verify Reset Code</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          className="form-control my-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter code"
          className="form-control my-2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary">Verify Code</button>
      </form>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
};

export default VerifyResetCode;
