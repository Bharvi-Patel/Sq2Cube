import { useState } from "react";
import { Link } from "react-router-dom";
import "./ForgetPass.css";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Later connect this with backend API
    console.log("Password reset requested for:", email);

    setMessage("Password reset link sent to your email.");
  };

  return (
    <div className="forgot-page">

      <div className="forgot-card">

        <h2>Forgot Password</h2>

        <p className="subtitle">
          Enter your email to receive a password reset link
        </p>

        <form onSubmit={handleSubmit}>

        <div className="input-group">
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          </div>

          <button className="auth-btn" type="submit">
            Send Reset Link
          </button>

        </form>

        {message && <p className="success">{message}</p>}

        <div className="back-login">
          <Link to="/login">Back to Login</Link>
        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;