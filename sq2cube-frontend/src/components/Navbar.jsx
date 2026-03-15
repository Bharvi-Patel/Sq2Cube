import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">

      <Link to="/" className="logo-wrapper">
        <img src="/LS20260227110715.png" alt="logo" className="logo-image" />
        <span className="logo-text">Sq2Cube</span>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        {isLoggedIn && <Link to="/upload">Upload</Link>}
        {isLoggedIn && <Link to="/history">History</Link>}
        {isLoggedIn && user?.is_admin && (
          <Link to="/admin" style={{ color:"#ff7a00", fontWeight:600 }}>⚙️ Admin</Link>
        )}
      </div>

      <div className="auth-links">
        {isLoggedIn ? (
          <>
            <Link to="/profile">
              {user?.profile_image ? (
                <img src={user.profile_image} alt="profile" className="nav-profile" />
              ) : (
                <div className="nav-profile-placeholder">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </Link>
            <button className="logout-nav-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
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