import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import PasswordInput from "../components/PasswordInput";

const Login = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const justVerified = location.state?.verified;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api("/login", {
        method: "POST",
        body: { email, password }
      });

      await login(data.token);  // sets token, fetches user from DB
      navigate("/");
    } catch (err) {
      setError(err.message || "Incorrect email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Login to your Sq2Cube account</p>

        {justVerified && (
          <div style={{
            background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)",
            borderRadius:"10px", padding:"12px 16px", marginBottom:"16px",
            fontSize:"14px", color:"#22c55e", textAlign:"center"
          }}>
            Your email has been verified! Please log in to continue.
          </div>
        )}

        <form onSubmit={handleLogin}>
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

          <PasswordInput
            id="login-password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div className="forgot-password">
            <Link to="/forgetPass">Forgot Password?</Link>
          </div>

          {error && (
            <p style={{ color: "#ef4444", marginBottom: "10px", fontSize: "14px" }}>
              {error}
            </p>
          )}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;