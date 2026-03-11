import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const profilePic = localStorage.getItem("profilePic");

  return (
    <nav className="navbar">

      {/* LEFT LOGO */}
      <div className="logo">
        <Link to="/" className="logo-wrapper">
          <img
            src="/LS20260227110715.png"
            alt="Sq2Cube Logo"
            className="logo-image"
          />
          <span className="logo-text">Sq2Cube</span>
        </Link>
      </div>

      {/* CENTER NAV */}
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/history">History</Link>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-links">

        {isLoggedIn ? (

          profilePic ? (
            <Link to="/profile">
              <img
                src={profilePic}
                alt="Profile"
                className="nav-profile"
              />
            </Link>
          ) : null

        ) : (

          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>

        )}

      </div>

    </nav>
  );
};

export default Navbar;