import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const GOOGLE_AUTH_URL = "http://localhost:8000/auth/google";
const GITHUB_AUTH_URL = "http://localhost:8000/auth/github";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Step 1: form fields
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");

  // Step 2: OTP
  const [step, setStep]     = useState(1);
  const [otp, setOtp]       = useState("");
  const [resent, setResent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // ── Step 1: Submit signup form ──────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirm)
      return setError("Passwords do not match.");

    setLoading(true);
    try {
      await api("/signup", {
        method: "POST",
        body: { email, password, username }
      });
      setStep(2);
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/verify-otp", {
        method: "POST",
        body: { email, code: otp }
      });
      // Don't auto-login — redirect to login page with success message
      navigate("/login", { state: { verified: true } });
    } catch (err) {
      setError(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    setError("");
    try {
      await api("/resend-otp", { method: "POST", body: { email } });
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">

        {/* ── STEP 1: Create Account ── */}
        {step === 1 && (
          <>
            <h1>Create your account</h1>
            <p className="auth-subtitle">Sign up to get started.</p>

            <form onSubmit={handleSignup}>
              <div className="input-group">
                <label>Username</label>
                <input type="text" placeholder="Your name"
                  value={username} onChange={e => setUsername(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input type="email" placeholder="yours@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input type="password" placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Confirm your password"
                  value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>

              {error && <p style={{ color:"#ef4444", fontSize:"14px", marginBottom:"10px" }}>{error}</p>}

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Sending code..." : "Continue"}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"20px 0" }}>
              <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.15)" }} />
              <span style={{ fontSize:"13px", opacity:0.5 }}>OR</span>
              <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.15)" }} />
            </div>

            {/* OAuth buttons */}
            <a href={GOOGLE_AUTH_URL} style={oauthBtn}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg"
                style={{ width:"20px", height:"20px" }} alt="Google" />
              Continue with Google
            </a>

            <a href={GITHUB_AUTH_URL} style={{ ...oauthBtn, marginTop:"10px" }}>
              <svg viewBox="0 0 24 24" style={{ width:"20px", height:"20px", fill:"white" }}>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </a>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Log In</Link>
            </p>

            <p style={{ fontSize:"12px", opacity:0.45, marginTop:"16px", lineHeight:1.5 }}>
              By continuing, you agree to our{" "}
              <a href="#" style={{ color:"#8f94fb" }}>Terms of Use</a> and{" "}
              <a href="#" style={{ color:"#8f94fb" }}>Privacy Policy</a>.
            </p>
          </>
        )}

        {/* ── STEP 2: OTP Verification ── */}
        {step === 2 && (
          <>
            <h1>Create your account</h1>

            <div style={{
              background:"rgba(255,255,255,0.06)", borderRadius:"10px",
              padding:"14px 16px", marginBottom:"24px",
              fontSize:"14px", color:"rgba(255,255,255,0.8)", lineHeight:1.5
            }}>
              An email with the code has been sent to <strong>{email}</strong>.
            </div>

            <form onSubmit={handleVerify}>
              <div className="input-group">
                <label>Code</label>
                <input
                  type="text"
                  placeholder="your 6-digit code"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/, "").slice(0, 6))}
                  maxLength={6}
                  required
                  style={{ letterSpacing:"6px", fontSize:"20px", textAlign:"center" }}
                />
              </div>

              {error && <p style={{ color:"#ef4444", fontSize:"14px", marginBottom:"10px" }}>{error}</p>}
              {resent && <p style={{ color:"#22c55e", fontSize:"14px", marginBottom:"10px" }}>New code sent!</p>}

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Continue"}
              </button>
            </form>

            <p style={{ marginTop:"16px", fontSize:"14px", textAlign:"center", opacity:0.7 }}>
              Did not receive the code?{" "}
              <span onClick={handleResend}
                style={{ color:"#8f94fb", cursor:"pointer", textDecoration:"underline" }}>
                Resend
              </span>
            </p>

            <p style={{ fontSize:"12px", opacity:0.45, marginTop:"16px", lineHeight:1.5 }}>
              By continuing, you agree to our{" "}
              <a href="#" style={{ color:"#8f94fb" }}>Terms of Use</a> and{" "}
              <a href="#" style={{ color:"#8f94fb" }}>Privacy Policy</a>.
            </p>
          </>
        )}

      </div>
    </section>
  );
};

const oauthBtn = {
  display:"flex", alignItems:"center", justifyContent:"center",
  gap:"10px", width:"100%", padding:"12px",
  borderRadius:"10px", border:"1px solid rgba(255,255,255,0.2)",
  background:"rgba(255,255,255,0.05)", color:"white",
  fontSize:"14px", fontWeight:500, cursor:"pointer",
  textDecoration:"none", boxSizing:"border-box", transition:"0.2s",
};

export default Signup;