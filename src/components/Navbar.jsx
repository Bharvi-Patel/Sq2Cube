import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      
        <div style={styles.logo}>
  <Link to="/" className="logo-wrapper">
    <img 
      src="/LS20260227110715.png" 
      alt="Sq2Cube Logo" 
      className="logo-image"
    />
    <span className="logo-text">Sq2Cube</span>
  </Link>
</div>

      <div style={styles.links}>
        <Link to="/">Home</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/history">History</Link>
      </div>

      <div style={styles.auth}>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 40px",
background: "linear-gradient(90deg, #1a1a1a, #222222)",
    color: "white",
  },
  logo: { fontWeight: "bold", fontSize: "18px" },
  links: { display: "flex", gap: "20px" },
  auth: { display: "flex", gap: "15px" },
};

export default Navbar;