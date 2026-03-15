import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api("/forgot-password", {
        method: "POST",
        body: { email }
      });
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">

        {sent ? (
          <>
            <div style={{ fontSize: "48px", textAlign: "center", marginBottom: "16px" }}>📬</div>
            <h1 style={{ textAlign: "center" }}>Check your email</h1>
            <p className="auth-subtitle" style={{ textAlign: "center" }}>
              If <strong>{email}</strong> is linked to an account, you'll receive
              a password reset link shortly. Check your spam folder too!
            </p>
            <Link to="/login" className="auth-btn" style={{
              display: "block", textAlign: "center", marginTop: "24px",
              textDecoration: "none", padding: "12px", borderRadius: "8px"
            }}>
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <h1>Forgot Password</h1>
            <p className="auth-subtitle">
              Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "10px" }}>
                  {error}
                </p>
              )}

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="auth-switch">
                Remember your password? <Link to="/login">Back to Login</Link>
              </p>
            </form>
          </>
        )}

      </div>
    </section>
  );
};

export default ForgotPassword;