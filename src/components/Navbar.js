import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaWallet, FaChartLine, FaHistory, FaSignOutAlt } from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // Call the onLogout callback to cleanup Firebase
      if (onLogout) {
        await onLogout();
      }

      // Navigate to login page
      navigate("/");
    } catch (error) {
      console.error('Error during logout:', error);
      // Still navigate even if there's an error
      navigate("/");
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <>
      {/* Logout Button at Top Right */}
      <button className="bottom-nav-logout-btn" onClick={handleLogout}>
        <FaSignOutAlt /> <span>Logout</span>
      </button>

      <nav className="bottom-nav-bar">
        <Link to="/dashboard" className={isActive("/dashboard")}>
          <span className="bottom-nav-icon"><FaHome /></span> <span>HOME</span>
        </Link>
        <Link to="/assets" className={isActive("/assets")}>
          <span className="bottom-nav-icon"><FaWallet /></span> <span>ASSET</span>
        </Link>

        {/* Spacer reserves the center slot so the other 4 links stay evenly spaced */}
        <span className="bottom-nav-swap-spacer" aria-hidden="true"></span>

        <Link to="/trade" className={isActive("/trade")}>
          <span className="bottom-nav-icon"><FaChartLine /></span> <span>CHART</span>
        </Link>
        <Link to="/history" className={isActive("/history")}>
          <span className="bottom-nav-icon"><FaHistory /></span> <span>HISTORY</span>
        </Link>

        {/* Featured/raised center button — icon only, rises above the bar like Moniepoint's FAB.
            Icon content is the orbiting-coins swap animation. */}
        <Link to="/swap" className={`bottom-nav-swap-btn ${isActive("/swap")}`} aria-label="Swap">
          <span className="bottom-nav-swap-pulse" aria-hidden="true"></span>
          <span className="bottom-nav-swap-icon-wrap">
            <span className="bottom-nav-swap-orbit-layer">
              <span className="bottom-nav-swap-coin bottom-nav-swap-coin-gold dash-orbit-a">$</span>
            </span>
            <span className="bottom-nav-swap-orbit-layer">
              <span className="bottom-nav-swap-coin bottom-nav-swap-coin-purple dash-orbit-b">₿</span>
            </span>
          </span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;