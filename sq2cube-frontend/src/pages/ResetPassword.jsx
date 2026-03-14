import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";

const ResetPassword = () => {
  const [searchParams]          = useSearchParams();
  const token                   = searchParams.get("token");
  const navigate                = useNavigate();

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      await api("/reset-password", {
        method: "POST",
        body: { token, new_password: password }
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <section className="auth-section">
      <div className="auth-card">
        <h1>Invalid Link</h1>
        <p className="auth-subtitle">This reset link is invalid or missing.</p>
        <Link to="/forgot-password" className="auth-btn"
          style={{ display:"block", textAlign:"center", textDecoration:"none", padding:"12px", borderRadius:"8px", marginTop:"16px" }}>
          Request a new link
        </Link>
      </div>
    </section>
  );

  return (
    <section className="auth-section">
      <div className="auth-card">

        {success ? (
          <>
            <div style={{ fontSize:"48px", textAlign:"center", marginBottom:"16px" }}>✅</div>
            <h1 style={{ textAlign:"center" }}>Password Reset!</h1>
            <p className="auth-subtitle" style={{ textAlign:"center" }}>
              Your password has been updated. Redirecting you to login...
            </p>
          </>
        ) : (
          <>
            <h1>Reset Password</h1>
            <p className="auth-subtitle">Enter your new password below.</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p style={{ color:"#ef4444", fontSize:"14px", marginBottom:"10px" }}>
                  {error}
                </p>
              )}

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <p className="auth-switch">
                <Link to="/login">Back to Login</Link>
              </p>
            </form>
          </>
        )}

      </div>
    </section>
  );
};

export default ResetPassword;