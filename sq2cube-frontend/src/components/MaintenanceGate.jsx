import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const MaintenanceGate = ({ children }) => {
  const { user } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin/maintenance`)
      .then(res => res.json())
      .then(data => setMaintenance(data.maintenance_mode))
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  // Wait until checked
  if (!checked) return null;

  // Admins bypass maintenance
  if (user?.is_admin) return children;

  // Show maintenance screen to everyone else
  if (maintenance) return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      textAlign: "center",
      padding: "40px",
      background: "linear-gradient(135deg, #0d0d0d, #1a1a1a, #ff7a00)",
    }}>
      <div style={{ fontSize: "72px", marginBottom: "24px" }}>🚧</div>
      <h1 style={{ fontSize: "36px", fontWeight: 700, margin: "0 0 16px" }}>
        We'll Be Back Soon
      </h1>
      <p style={{
        fontSize: "16px", color: "rgba(255,255,255,0.6)",
        maxWidth: "480px", lineHeight: 1.7, margin: "0 0 32px"
      }}>
        Sq2Cube is currently undergoing maintenance. We're working hard to
        improve your experience. Please check back shortly!
      </p>
      <div style={{
        padding: "16px 28px",
        background: "rgba(255,122,0,0.1)",
        border: "1px solid rgba(255,122,0,0.3)",
        borderRadius: "12px",
        fontSize: "14px",
        color: "rgba(255,255,255,0.6)",
      }}>
        🔧 Maintenance in progress — we'll be back shortly.
      </div>
    </div>
  );

  return children;
};

export default MaintenanceGate;