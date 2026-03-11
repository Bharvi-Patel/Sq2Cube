import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    console.log(email, password);

    alert("Logged in successfully!");

    // redirect to profile setup page
    navigate("/profileSetup");
  };

  return (
    <section className="auth-section">
      <div className="auth-card">

        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Login to your Sq2Cube account</p>

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

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="forgot-password">
            <Link to="/forgetPass">Forgot Password?</Link>
          </div>

          <button className="auth-btn" type="submit">
            Login
          </button>

          <p className="auth-switch">
            Or <Link to="/signup">Create account</Link>
          </p>

        </form>

      </div>
    </section>
  );
};

export default Login;