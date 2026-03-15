import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer style={{
      background: "#0a0a0a",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      padding: "32px 60px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
      color: "rgba(255,255,255,0.4)",
      fontSize: "14px",
    }}>

      <span>© {new Date().getFullYear()} Sq2Cube. All rights reserved.</span>

      <div style={{ display: "flex", gap: "28px" }}>
        {[
          { label: "About Us",   to: "/about"   },
          { label: "Contact Us", to: "/contact" },
          { label: "Help",       to: "/help"    },
        ].map(link => (
          <Link key={link.to} to={link.to} style={{
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => e.target.style.color = "#ff7a00"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
          >
            {link.label}
          </Link>
        ))}
      </div>

    </footer>
  );
};

export default Footer;