import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaRocketchat,
  FaUserCircle,
  FaBook,
  FaRegLightbulb,
  FaEnvelope,
  FaPlusCircle,
  FaStore,
  FaBell,
  FaFileContract
} from "react-icons/fa";
import NotificationBadge from "./NotificationBadge";
import "./Settings.css";

const Settings = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchStarRating = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/portfolio/`,
          { headers: { Authorization: `Token ${token}` } }
        );
        const balance = response.data.balance_usd;
        let calculatedStarRating = 1;
        if (balance >= 5000) calculatedStarRating = 5;
        else if (balance >= 1000) calculatedStarRating = 4;
        else if (balance >= 301) calculatedStarRating = 3;
        else if (balance >= 101) calculatedStarRating = 2;
        console.log("User star rating:", calculatedStarRating);
      } catch (error) {
        console.error("Error fetching star rating:", error);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/notifications/unread-count/`,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchStarRating();
    fetchUnreadCount();

    const pollInterval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>SETTINGS</h2>
        <p>Customize your experience and manage your account</p>
      </div>

      <div className="settings-options">

        <Link to="/profile" className="settings-item">
          <div className="settings-icon-box">
            <FaUserCircle />
          </div>
          <span className="settings-item-title">Profile</span>
        </Link>

        <Link to="/create-token" className="settings-item">
          <div className="settings-icon-box">
            <FaPlusCircle />
          </div>
          <span className="settings-item-title">Create Token</span>
        </Link>

        <Link to="/merchant" className="settings-item">
          <div className="settings-icon-box">
            <FaStore />
          </div>
          <span className="settings-item-title">Merchant</span>
        </Link>

        <a
          href="https://t.me/Swapview"
          target="_blank"
          rel="noopener noreferrer"
          className="settings-item"
        >
          <div className="settings-icon-box">
            <FaRocketchat />
          </div>
          <span className="settings-item-title">What's New</span>
        </a>

        <Link to="/notifications" className="settings-item">
          <div className="settings-icon-box">
            <FaBell />
          </div>
          <span className="settings-item-title">Notifications</span>
          {unreadCount > 0 && <NotificationBadge />}
        </Link>

        <Link to="/condition" className="settings-item">
          <div className="settings-icon-box">
            <FaFileContract />
          </div>
          <span className="settings-item-title">Terms & Conditions</span>
        </Link>

        <Link to="/about" className="settings-item">
          <div className="settings-icon-box">
            <FaBook />
          </div>
          <span className="settings-item-title">About</span>
        </Link>

        <Link to="/FAQ" className="settings-item">
          <div className="settings-icon-box">
            <FaRegLightbulb />
          </div>
          <span className="settings-item-title">FAQs</span>
        </Link>

        <a href="mailto:support@swapviewapplications.com" className="settings-item">
          <div className="settings-icon-box">
            <FaEnvelope />
          </div>
          <span className="settings-item-title">Contact Us</span>
        </a>

      </div>
    </div>
  );
};

export default Settings;