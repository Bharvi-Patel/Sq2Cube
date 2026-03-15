import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token).then(() => navigate("/"));
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <section className="auth-section">
      <div className="auth-card" style={{ textAlign:"center" }}>
        <p style={{ opacity:0.6 }}>Signing you in...</p>
      </div>
    </section>
  );
};

export default OAuthSuccess;