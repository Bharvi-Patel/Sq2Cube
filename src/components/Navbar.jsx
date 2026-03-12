import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {

  const profilePic = localStorage.getItem("profilePic");

  return (
    <nav className="navbar">

      {/* LEFT LOGO */}
      <Link to="/" className="logo-wrapper">
        <img src="/public/LS20260227110715.png" alt="logo" className="logo-image"/>
        <span className="logo-text">Sq2Cube</span>
      </Link>

      {/* CENTER NAV */}
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/history">History</Link>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-links">

        {profilePic ? (

          <Link to="/profile">
            <img
              src={profilePic}
              alt="profile"
              className="nav-profile"
            />
          </Link>

        ) : (

          <>
            <Link to="/Login">Login</Link>
            <Link to="/Signup">Signup</Link>
          </>

        )}

      </div>

    </nav>
  );
};

export default Navbar;