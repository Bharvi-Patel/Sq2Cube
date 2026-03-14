import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                     = useState("");
  const [loading, setLoading]                 = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const data = await api("/signup", {
        method: "POST",
        body: { email, password, username: email.split("@")[0] }
      });

      await login(data.token);  // log them in immediately after signup
      navigate("/profileSetup");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Sign up to start generating 3D models</p>

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Create a password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Confirm your password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          {error && (
            <p style={{ color: "#ef4444", marginBottom: "10px", fontSize: "14px" }}>{error}</p>
          )}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Signup;