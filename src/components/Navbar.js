import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaWallet, FaChartLine, FaHistory, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasActiveBonus, setHasActiveBonus] = useState(false);

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

  // Check if the user has an active TradeFi claim.
  // Fetches once on mount; re-fetches when the route changes so the widget
  // appears/disappears as soon as the user claims or the claim settles.
  useEffect(() => {
    let isMounted = true;

    const checkBonusStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          if (isMounted) setHasActiveBonus(false);
          return;
        }
        const config = { headers: { Authorization: `Token ${token}` } };
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/bonus/status/`,
          config
        );
        if (isMounted) {
          setHasActiveBonus(res.data?.state === "active");
        }
      } catch (err) {
        // Fail quiet — no active bonus is a fine default
        if (isMounted) setHasActiveBonus(false);
      }
    };

    checkBonusStatus();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const isDashboard = location.pathname === "/dashboard";
  const showBonusWidget = isDashboard && hasActiveBonus;

  return (
    <>
      {/* Logout Button at Top Right */}
      <button className="bottom-nav-logout-btn" onClick={handleLogout}>
        <FaSignOutAlt /> <span>Logout</span>
      </button>

      {/* Bonus widget — purple diamond, shown only on the dashboard when
          the user has an active TradeFi claim. Sits under the logout button. */}
      {showBonusWidget && (
        <button
          className="bottom-nav-bonus-widget"
          onClick={() => navigate("/bonus")}
          aria-label="Active TradeFi bonus"
          title="Your TradeFi bonus is active"
        >
          <span className="bottom-nav-bonus-diamond" aria-hidden="true" />
        </button>
      )}

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